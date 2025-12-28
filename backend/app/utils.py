import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import emails  # type: ignore
import jwt
from jinja2 import Template
from jwt.exceptions import InvalidTokenError

from app.core import security
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class EmailData:
    html_content: str
    subject: str


def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    template_path = Path(__file__).parent / "email-templates" / "build" / template_name
    logger.debug(f"Looking for email template at: {template_path}")
    if not template_path.exists():
        # List available files for debugging
        build_dir = template_path.parent
        available_files = list(build_dir.glob("*.html")) if build_dir.exists() else []
        error_msg = (
            f"Email template not found: {template_path}. "
            f"Make sure MJML templates are compiled. "
            f"Available files in build directory: {[f.name for f in available_files]}"
        )
        logger.error(error_msg)
        raise FileNotFoundError(error_msg)
    template_str = template_path.read_text()
    html_content = Template(template_str).render(context)
    return html_content


def send_email(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
) -> None:
    assert settings.emails_enabled, "no provided configuration for email variables"
    
    def clean_string(s: str, aggressive: bool = False) -> str:
        """Clean string from problematic Unicode characters that cause ASCII encoding errors."""
        if not s:
            return ""
        s = str(s)
        cleaned = s.replace('\xa0', ' ').replace('\u200b', '').replace('\u200c', '').replace('\u200d', '').replace('\u00a0', ' ')
        if aggressive:
            cleaned = ''.join(char if ord(char) < 128 or char.isprintable() else ' ' for char in cleaned)
            cleaned = ' '.join(cleaned.split())
        return cleaned.encode('utf-8', errors='replace').decode('utf-8')
    
    from_email_name = clean_string(str(settings.EMAILS_FROM_NAME or ""), aggressive=True)
    from_email_addr = str(settings.EMAILS_FROM_EMAIL)
    clean_subject = clean_string(str(subject), aggressive=True)
    clean_html = clean_string(str(html_content), aggressive=True)
    
    from email.utils import formataddr
    mail_from_formatted = formataddr((from_email_name, from_email_addr)) if from_email_name else from_email_addr
    
    message = emails.Message(
        subject=clean_subject,
        html=clean_html,
        mail_from=mail_from_formatted,
    )
    smtp_options = {"host": settings.SMTP_HOST, "port": settings.SMTP_PORT}
    if settings.SMTP_TLS:
        smtp_options["tls"] = True
    elif settings.SMTP_SSL:
        smtp_options["ssl"] = True
    if settings.SMTP_USER:
        smtp_options["user"] = clean_string(str(settings.SMTP_USER), aggressive=False).strip()
    if settings.SMTP_PASSWORD:
        smtp_options["password"] = clean_string(str(settings.SMTP_PASSWORD), aggressive=False).strip()
    
    try:
        response = message.send(to=email_to, smtp=smtp_options)
        if isinstance(response, bool) and not response:
            raise Exception("Email send returned False")
        elif hasattr(response, 'status_code') and response.status_code != 250:
            error_detail = str(response.error) if hasattr(response, 'error') else ""
            error_msg = f"Email send failed: {error_detail}"
            if '535' in error_detail or 'BadCredentials' in error_detail or 'Username and Password not accepted' in error_detail:
                error_msg += "\n\nGmail requires an App Password. See: https://myaccount.google.com/apppasswords"
            raise Exception(error_msg)
        elif hasattr(response, 'error') and response.error:
            error_detail = str(response.error)
            error_msg = f"Email send failed: {error_detail}"
            if '535' in error_detail or 'BadCredentials' in error_detail or 'Username and Password not accepted' in error_detail:
                error_msg += "\n\nGmail requires an App Password. See: https://myaccount.google.com/apppasswords"
            raise Exception(error_msg)
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        raise


def generate_test_email(email_to: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Test email"
    html_content = render_email_template(
        template_name="test_email.html",
        context={"project_name": settings.PROJECT_NAME, "email": email_to},
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_reset_password_email(email_to: str, email: str, token: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Password recovery for user {email}"
    link = f"{settings.FRONTEND_HOST}/reset-password?token={token}"
    html_content = render_email_template(
        template_name="reset_password.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": email,
            "email": email_to,
            "valid_hours": settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
            "link": link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_new_account_email(
    email_to: str, username: str, password: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - New account for user {username}"
    html_content = render_email_template(
        template_name="new_account.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": username,
            "password": password,
            "email": email_to,
            "link": settings.FRONTEND_HOST,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_new_contact_email(
    name: str, email: str, phone: str, message: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - New contact message from {name}"
    html_content = render_email_template(
        template_name="new_contact.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "name": name,
            "email": email,
            "phone": phone,
            "message": message,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_password_reset_token(email: str) -> str:
    delta = timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
    now = datetime.now(timezone.utc)
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": email},
        settings.SECRET_KEY,
        algorithm=security.ALGORITHM,
    )
    return encoded_jwt


def verify_password_reset_token(token: str) -> str | None:
    try:
        decoded_token = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        return str(decoded_token["sub"])
    except InvalidTokenError:
        return None
