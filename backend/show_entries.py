from sqlmodel import Session, select
from app.core.db import engine
from app.models import User

def main():
    print("Connecting to database...")
    try:
        with Session(engine) as session:
            statement = select(User).limit(5)
            results = session.exec(statement).all()
            
            if not results:
                print("No users found in the database.")
            else:
                print(f"Found {len(results)} users:")
                for user in results:
                    print(f"ID: {user.id} | Email: {user.email} | Name: {user.full_name} | Superuser: {user.is_superuser}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
