import sys
sys.path.insert(0, r"C:\Users\vivek\Team4\backend")
from sqlalchemy import text, inspect
from app.database import engine, Base
import app.models

def migrate():
    inspector = inspect(engine)
    with engine.begin() as conn:
        if inspector.has_table("users"):
            cols = {c["name"] for c in inspector.get_columns("users")}
            if "name" in cols and "full_name" not in cols:
                print("Renaming users.name to users.full_name...")
                conn.execute(text("ALTER TABLE users RENAME COLUMN name TO full_name;"))
            elif "full_name" not in cols:
                print("Adding full_name column to users...")
                conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR(100) NOT NULL DEFAULT '';"))

            statements = [
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'viewer';",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_hash VARCHAR(255);",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_attempts INTEGER;",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_last_sent_at TIMESTAMPTZ;",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_hash VARCHAR(255);",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_expires_at TIMESTAMPTZ;",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_attempts INTEGER DEFAULT 0;",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_verified_until TIMESTAMPTZ;",
            ]
            for stmt in statements:
                conn.execute(text(stmt))

        if inspector.has_table("subscriptions"):
            sub_statements = [
                "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);",
                "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100);",
                "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255);",
                "CREATE INDEX IF NOT EXISTS ix_subscriptions_razorpay_order_id ON subscriptions (razorpay_order_id);",
                "CREATE INDEX IF NOT EXISTS ix_subscriptions_razorpay_payment_id ON subscriptions (razorpay_payment_id);",
            ]
            for stmt in sub_statements:
                conn.execute(text(stmt))

    print("Running Base.metadata.create_all...")
    Base.metadata.create_all(bind=engine)
    print("Migration completed successfully!")

if __name__ == "__main__":
    migrate()
