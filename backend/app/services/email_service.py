
import os
import smtplib
import logging
from email.message import EmailMessage

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


def send_otp_email(to_email: str, otp: str) -> None:
    """Send a verification or password-reset OTP by email."""

    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    if not smtp_email or not smtp_password:
        raise RuntimeError("SMTP email configuration is missing.")

    message = EmailMessage()
    message["From"] = smtp_email
    message["To"] = to_email
    message["Subject"] = "Your StreamHub OTP Verification Code"

    message.set_content(
        f"""Hello,

Your StreamHub OTP is: {otp}

This code is valid for 5 minutes.
Do not share this code with anyone.

If you did not request this code, please ignore this email.

Regards,
StreamHub Team
"""
    )

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(smtp_email, smtp_password)
            server.send_message(message)

        logger.info("OTP email sent successfully.")

    except (smtplib.SMTPException, OSError):
        logger.exception("Failed to send OTP email.")
        raise
