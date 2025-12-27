from typing import Any
from fastapi import APIRouter, HTTPException

from app.api.deps import SessionDep
from app.core.config import settings
from app.models import Contact, ContactCreate, Message
from app.utils import generate_new_contact_email, send_email

router = APIRouter()


@router.post("/", response_model=Message, status_code=201)
def create_contact(
    *,
    session: SessionDep,
    contact_in: ContactCreate,
) -> Any:
    """
    Create a new contact message from the contact form.
    Saves the contact to the database and sends an email notification to the admin.
    """
    contact = Contact.model_validate(contact_in)
    session.add(contact)
    session.commit()
    session.refresh(contact)
    
    # Send email notification to admin if emails are enabled
    if settings.emails_enabled:
        try:
            email_data = generate_new_contact_email(
                name=contact_in.name,
                email=contact_in.email,
                phone=contact_in.phone,
                message=contact_in.message,
            )
            send_email(
                email_to=settings.FIRST_SUPERUSER,
                subject=email_data.subject,
                html_content=email_data.html_content,
            )
        except Exception as e:
            # Log error but don't fail the request if email sending fails
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send contact notification email: {e}")
    
    return Message(message="Contact message sent successfully")

