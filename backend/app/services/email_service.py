import os
import smtplib
import logging
from email.message import EmailMessage

from dotenv import load_dotenv

logger = logging.getLogger(__name__)


def send_otp_email(to_email: str, otp: str) -> None:
    """Send a verification or password-reset OTP by email."""

    # Reload environment to ensure latest .env changes are always used
    load_dotenv(override=True)

    delivery_mode = os.getenv("OTP_DELIVERY_MODE", "email").lower()
    smtp_email = os.getenv("SMTP_EMAIL", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip().replace(" ", "")

    # Only print to console if explicitly configured for console-only mode
    if delivery_mode == "console":
        print(f"\n==========================================")
        print(f"[STREAMHUB OTP] Verification code for {to_email}: {otp}")
        print(f"==========================================\n")
        return

    # If email credentials are not configured
    if not smtp_email or not smtp_password:
        logger.warning("SMTP_EMAIL or SMTP_PASSWORD is empty in .env. Skipping email dispatch.")
        return

    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    message = EmailMessage()
    message["From"] = f"StreamHub <{smtp_email}>"
    message["To"] = to_email
    message["Subject"] = "StreamHub - Your OTP Verification Code"

    message.set_content(
        f"""Hello,

Your StreamHub OTP verification code is: {otp}

This code is valid for 5 minutes.
Do not share this code with anyone.

If you did not request this code, please ignore this email.

Regards,
StreamHub Team
"""
    )

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(smtp_email, smtp_password)
            server.send_message(message)

        logger.info("OTP email sent successfully to %s via %s", to_email, smtp_email)

    except smtplib.SMTPAuthenticationError as auth_err:
        logger.error("Gmail SMTP authentication failed. App Password required. %s", auth_err)
        raise RuntimeError(
            "Gmail authentication failed. You must use a 16-character Google App Password in .env, not your standard account password."
        ) from auth_err
    except Exception as exc:
        logger.exception("Failed to send OTP email to %s", to_email)
        raise
