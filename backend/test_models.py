
import sys
import os
from sqlmodel import Session, select, create_engine

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ssh_util import ssh_tunnel
from app.models import AdminUser, Contact, Tour, TourDate, SiteUser

# Configuration
DB_HOST = "127.0.0.1"
DB_PORT = "5432"
DB_USER = "app_user"
DB_PASS = "Savanaanastasiasitepostgres12"
DB_NAME = "anastasia_db"

def main():
    print(f"Connecting to database at {DB_HOST}:{DB_PORT}...")
    try:
        with ssh_tunnel():
            # Create engine inside the tunnel context
            # SQLModel uses SQLAlchemy engine
            database_url = f"postgresql+psycopg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
            engine = create_engine(database_url)
            
            with Session(engine) as session:
                print("--- Testing AdminUser ---")
                admins = session.exec(select(AdminUser)).all()
                for admin in admins:
                    print(f"ID: {admin.id}, Username: {admin.username}")
                
                print("\n--- Testing Tours ---")
                tours = session.exec(select(Tour).limit(5)).all()
                for tour in tours:
                    print(f"ID: {tour.id}, Name: {tour.name}, Slug: {tour.slug}")
                    
                print("\n--- Testing Tour Dates ---")
                dates = session.exec(select(TourDate).limit(5)).all()
                for d in dates:
                    print(f"ID: {d.id}, Date: {d.date}, Time: {d.time}, TourID: {d.tour_id}")
                    if d.tour:
                         print(f"  -> Belongs to Tour: {d.tour.name}")
                
                print("\n--- Testing Users ---")
                users = session.exec(select(SiteUser)).all()
                for user in users:
                    print(f"ID: {user.id}, Email: {user.email}")

    except Exception as e:
        print(f"FAILURE: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
