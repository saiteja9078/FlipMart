"""
Email service — sends order confirmation emails via SMTP.
Fails silently so orders still go through even if email fails.
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import get_settings


def send_order_confirmation(
    to_email: str,
    user_name: str,
    order_number: str,
    total_amount: float,
    items: list[dict],
) -> bool:
    """
    Send an HTML order confirmation email.
    Returns True if sent, False if failed (never raises).
    """
    settings = get_settings()

    # Skip if SMTP not configured
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        print(f"📧 [MOCK] Order confirmation for {to_email}: {order_number} — ₹{total_amount:,.0f}")
        return True

    try:
        items_html = ""
        for item in items:
            items_html += f"""
            <tr>
                <td style="padding:8px;border-bottom:1px solid #eee;">{item['name']}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">{item['quantity']}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹{item['price']:,.0f}</td>
            </tr>
            """

        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#2874f0;color:#fff;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
                <h1 style="margin:0;font-size:24px;">FlipMart</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Order Confirmation</p>
            </div>
            <div style="background:#fff;padding:24px;border:1px solid #e8e8e8;border-top:none;">
                <p>Hi <strong>{user_name}</strong>,</p>
                <p>Your order has been placed successfully! 🎉</p>
                <div style="background:#f9f9f9;padding:16px;border-radius:6px;margin:16px 0;">
                    <p style="margin:0;"><strong>Order ID:</strong> {order_number}</p>
                    <p style="margin:4px 0 0;"><strong>Total:</strong> ₹{total_amount:,.0f}</p>
                </div>
                <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                    <thead>
                        <tr style="background:#f5f5f5;">
                            <th style="padding:8px;text-align:left;">Item</th>
                            <th style="padding:8px;text-align:center;">Qty</th>
                            <th style="padding:8px;text-align:right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>{items_html}</tbody>
                </table>
                <p style="color:#888;font-size:13px;">Thank you for shopping with FlipMart!</p>
            </div>
        </div>
        """

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"FlipMart — Order Confirmed ({order_number})"
        msg["From"] = settings.SMTP_USER
        msg["To"] = to_email
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        print(f"📧 Email sent to {to_email} for order {order_number}")
        return True

    except Exception as e:
        print(f"⚠️ Email failed for {to_email}: {e}")
        return False


def send_order_cancellation(
    to_email: str,
    user_name: str,
    order_number: str,
) -> bool:
    """
    Send an HTML order cancellation email.
    Returns True if sent, False if failed (never raises).
    """
    settings = get_settings()

    # Skip if SMTP not configured
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        print(f"📧 [MOCK] Order cancellation for {to_email}: {order_number}")
        return True

    try:
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#e02424;color:#fff;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
                <h1 style="margin:0;font-size:24px;">FlipMart</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Order Cancelled</p>
            </div>
            <div style="background:#fff;padding:24px;border:1px solid #e8e8e8;border-top:none;">
                <p>Hi <strong>{user_name}</strong>,</p>
                <p>Your order <strong>{order_number}</strong> has been cancelled successfully.</p>
                <p>If you have already paid, a refund will be initiated to your original payment method within 5-7 business days.</p>
                <p style="color:#888;font-size:13px;margin-top:24px;">We hope to see you again soon at FlipMart!</p>
            </div>
        </div>
        """

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"FlipMart — Order Cancelled ({order_number})"
        msg["From"] = settings.SMTP_USER
        msg["To"] = to_email
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        print(f"📧 Cancellation email sent to {to_email} for order {order_number}")
        return True

    except Exception as e:
        print(f"⚠️ Email failed for {to_email}: {e}")
        return False
