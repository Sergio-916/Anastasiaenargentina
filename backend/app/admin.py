"""
SQLAdmin configuration for FastAPI application.
Provides admin interface for managing database models.
"""
from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.middleware.sessions import SessionMiddleware
from starlette.requests import Request
from sqlmodel import Session, select

from app.core.db import engine
from app.core.security import verify_password
from app.models import (
    User,
    Item,
    Contact,
    Tour,
    TourDate,
    AdminUser,
    SiteUser,
)


class AdminAuth(AuthenticationBackend):
    """
    Custom authentication backend for SQLAdmin.
    Uses existing User model and password verification.
    """
    
    async def login(self, request: Request) -> bool:
        """
        Handle login form submission.
        Validates credentials against User model.
        """
        form = await request.form()
        username = form.get("username")
        password = form.get("password")
        
        if not username or not password:
            return False
        
        # Check against AdminUser table first, then User table
        with Session(engine) as session:
            # Try AdminUser first
            admin_user = session.exec(
                select(AdminUser).where(AdminUser.username == username)
            ).first()
            
            if admin_user:
                if verify_password(password, admin_user.password_hash):
                    request.session.update({"admin_user_id": str(admin_user.id)})
                    request.session.update({"admin_username": admin_user.username})
                    return True
            
            # Try User table (for superusers)
            user = session.exec(
                select(User).where(User.email == username)
            ).first()
            
            if user and user.is_superuser and user.is_active:
                if verify_password(password, user.hashed_password):
                    request.session.update({"admin_user_id": str(user.id)})
                    request.session.update({"admin_username": user.email})
                    return True
        
        return False
    
    async def logout(self, request: Request) -> bool:
        """
        Handle logout - clear session.
        """
        request.session.clear()
        return True
    
    async def authenticate(self, request: Request) -> bool:
        """
        Check if user is authenticated.
        """
        admin_user_id = request.session.get("admin_user_id")
        return bool(admin_user_id)


# User Admin Views
class UserAdmin(ModelView, model=User):
    """
    Admin interface for User model.
    """
    column_list = [User.id, User.email, User.full_name, User.is_active, User.is_superuser]
    column_searchable_list = [User.email, User.full_name]
    column_sortable_list = [User.id, User.email, User.is_active, User.is_superuser]
    column_default_sort = [(User.id, True)]
    name = "User"
    name_plural = "Users"
    icon = "fa-solid fa-user"
    category = "Accounts"
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True
    can_export = True


class ItemAdmin(ModelView, model=Item):
    """
    Admin interface for Item model.
    """
    column_list = [Item.id, Item.title, Item.description, Item.owner_id]
    column_searchable_list = [Item.title, Item.description]
    column_sortable_list = [Item.id, Item.title]
    column_default_sort = [(Item.id, True)]
    name = "Item"
    name_plural = "Items"
    icon = "fa-solid fa-box"
    category = "Content"
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True
    can_export = True


class ContactAdmin(ModelView, model=Contact):
    """
    Admin interface for Contact model.
    """
    column_list = [Contact.id, Contact.name, Contact.email, Contact.phone, Contact.created_at]
    column_searchable_list = [Contact.name, Contact.email, Contact.phone]
    column_sortable_list = [Contact.id, Contact.created_at]
    column_default_sort = [(Contact.created_at, True)]
    name = "Contact"
    name_plural = "Contacts"
    icon = "fa-solid fa-envelope"
    category = "Content"
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True
    can_export = True


class TourAdmin(ModelView, model=Tour):
    """
    Admin interface for Tour model.
    """
    column_list = [
        Tour.id,
        Tour.name,
        Tour.slug,
        Tour.duration,
        Tour.cost,
        Tour.max_capacity,
    ]
    column_searchable_list = [Tour.name, Tour.slug, Tour.description]
    column_sortable_list = [Tour.id, Tour.name, Tour.duration, Tour.max_capacity]
    column_default_sort = [(Tour.id, True)]
    name = "Tour"
    name_plural = "Tours"
    icon = "fa-solid fa-map"
    category = "Content"
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True
    can_export = True


class TourDateAdmin(ModelView, model=TourDate):
    """
    Admin interface for TourDate model.
    """
    column_list = [TourDate.id, TourDate.tour_id, TourDate.tour, TourDate.date, TourDate.time]
    column_searchable_list = [TourDate.time]
    column_sortable_list = [TourDate.id, TourDate.date, TourDate.tour_id]
    column_default_sort = [(TourDate.date, True)]
    name = "Tour Date"
    name_plural = "Tour Dates"
    icon = "fa-solid fa-calendar"
    category = "Content"
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True
    can_export = True


class AdminUserAdmin(ModelView, model=AdminUser):
    """
    Admin interface for AdminUser model.
    """
    column_list = [AdminUser.id, AdminUser.username, AdminUser.created_at, AdminUser.updated_at]
    column_searchable_list = [AdminUser.username]
    column_sortable_list = [AdminUser.id, AdminUser.created_at]
    column_default_sort = [(AdminUser.id, True)]
    name = "Admin User"
    name_plural = "Admin Users"
    icon = "fa-solid fa-user-shield"
    category = "Accounts"
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True
    can_export = True


class SiteUserAdmin(ModelView, model=SiteUser):
    """
    Admin interface for SiteUser model.
    """
    column_list = [SiteUser.id, SiteUser.name, SiteUser.email, SiteUser.emailVerified]
    column_searchable_list = [SiteUser.name, SiteUser.email]
    column_sortable_list = [SiteUser.id, SiteUser.email, SiteUser.emailVerified]
    column_default_sort = [(SiteUser.id, True)]
    name = "Site User"
    name_plural = "Site Users"
    icon = "fa-solid fa-users"
    category = "Accounts"
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True
    can_export = True


def setup_admin(app, secret_key: str) -> Admin:
    """
    Setup SQLAdmin with authentication and all model views.
    
    Args:
        app: FastAPI application instance
        secret_key: Secret key for session management
        
    Returns:
        Admin instance
    """
    # Add session middleware for authentication
    app.add_middleware(SessionMiddleware, secret_key=secret_key, max_age=60*60*24*30, https_only=False, same_site='lax')
    
    # Create authentication backend
    authentication_backend = AdminAuth(secret_key=secret_key)
    
    # Initialize admin
    admin = Admin(
        app=app,
        engine=engine,
        authentication_backend=authentication_backend,
        base_url="/admin",
        title="Admin Panel",
    )
    
    # Add all views
    admin.add_view(UserAdmin)
    admin.add_view(ItemAdmin)
    admin.add_view(ContactAdmin)
    admin.add_view(TourAdmin)
    admin.add_view(TourDateAdmin)
    admin.add_view(AdminUserAdmin)
    admin.add_view(SiteUserAdmin)
    
    return admin

