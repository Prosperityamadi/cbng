import resend
from typing import Optional
from api.config import settings

# Initialize Resend
if settings.RESEND_API_KEY:
    resend.api_key = settings.RESEND_API_KEY


class EmailService:
    @staticmethod
    def send_otp_email(recipient_email: str, otp_code: str) -> dict:
        """
        Sends an ultra-luxury, high-contrast security OTP verification email.
        Sender: verify@nemicapbank.com
        Reply-To: support@nemicapbank.com
        """
        subject = f"Your NemiCapital Security Code: {otp_code}"
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F9FAFB; width: 100%; height: 100%; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 500px; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <img src="https://cbng-ten.vercel.app/logo192.png" alt="NemiCapital Logo" width="64" height="64" style="display: block; margin-bottom: 16px; border-radius: 12px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.025em;">Verify your email</h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4B5563;">
                Enter the following code to authorize your NemiCapital digital banking access.
              </p>

              <!-- OTP Code Box -->
              <div style="background-color: #F3F4F6; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 700; letter-spacing: 0.25em; color: #111827;">
                  {otp_code}
                </div>
              </div>

              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;">
                This code expires in <strong>5 minutes</strong>.
              </p>
              <p style="margin: 0; font-size: 13px; color: #9CA3AF;">
                If you didn't request this, please ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #9CA3AF;">
                © 2026 NemiCapital International Bank.<br>
                Member FDIC. Equal Housing Lender.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        """

        params = {
            "from": settings.EMAIL_FROM_VERIFY,
            "to": [recipient_email],
            "reply_to": settings.EMAIL_REPLY_TO,
            "subject": subject,
            "html": html_content,
        }

        return resend.Emails.send(params)

    @staticmethod
    def send_welcome_email(
        recipient_email: str,
        client_name: str,
        account_number: str,
        routing_number: str = "021000021",
        account_type: str = "checking",
        account_tier: str = "private_wealth",
        password: Optional[str] = None,
        transaction_pin: Optional[str] = None,
        initial_balance: Optional[float] = None
    ) -> dict:
        """
        Sends an official Private Wealth onboarding congratulatory letter.
        Sender: hello@nemicapbank.com
        Reply-To: support@nemicapbank.com
        """
        subject = "Welcome to NemiCapital International Bank — Private Wealth Account Activated"
        masked_account = f"•••• •••• {account_number[-4:]}"
        tier_display = {
            "private_wealth": "Tier 1 Private Wealth",
            "premier": "Premier Institutional",
            "standard": "Standard Private Banking"
        }.get(account_tier, "Private Wealth")
        account_type_display = "Checking" if account_type.lower() == "checking" else "Savings Reserve"

        credentials_section = ""
        if password or transaction_pin:
            pin_row = f"""
                <tr>
                  <td style="padding: 14px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <div style="font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">4-DIGIT SECURITY PIN</div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 17px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.25em;">{transaction_pin}</div>
                    <div style="font-size: 11px; color: #666666; margin-top: 2px;">Required to authorize wire transfers and vault actions</div>
                  </td>
                </tr>
            """ if transaction_pin else ""

            password_row = f"""
                <tr>
                  <td style="padding: 14px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <div style="font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">LOGIN CREDENTIALS</div>
                    <div style="font-size: 13px; color: #CCCCCC; margin-bottom: 4px;">Username / Email: <strong style="color: #FFFFFF;">{recipient_email}</strong></div>
                    <div style="font-size: 13px; color: #CCCCCC;">Password: <code style="font-family: 'Courier New', Courier, monospace; font-size: 14px; font-weight: 700; color: #B81446; background-color: rgba(184, 20, 70, 0.1); padding: 2px 6px; border-radius: 4px;">{password}</code></div>
                  </td>
                </tr>
            """ if password else ""

            credentials_section = f"""
              <!-- Security Access Credentials -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #121111; border: 1px solid rgba(184, 20, 70, 0.3); border-radius: 6px; padding: 20px; margin-bottom: 28px;">
                <tr>
                  <td style="padding-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                    <div style="font-size: 11px; font-weight: 700; color: #B81446; text-transform: uppercase; letter-spacing: 0.15em;">CLIENT ACCESS & AUTHORIZATION</div>
                  </td>
                </tr>
                {password_row}
                {pin_row}
              </table>
            """

        balance_row = ""
        if initial_balance and float(initial_balance) > 0:
            balance_row = f"""
                <tr>
                  <td style="padding-top: 14px;">
                    <div style="font-size: 11px; color: #777777; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">OPENING AVAILABLE LIQUIDITY</div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 17px; font-weight: 800; color: #10B981;">${float(initial_balance):,.2f} USD</div>
                  </td>
                </tr>
            """

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F0E0E; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0F0E0E; width: 100%; height: 100%;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #1A1818; border: 1px solid rgba(255, 255, 255, 0.08); border-top: 4px solid #B81446; border-radius: 8px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 36px 40px 24px 40px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: #B81446; text-transform: uppercase; margin-bottom: 6px;">
                PRIVATE WEALTH ADMISSIONS
              </div>
              <div style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #FFFFFF;">
                NemiCapital <span style="font-weight: 300; color: #999999;">International Bank</span>
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 40px;">
              <p style="font-size: 16px; font-weight: 600; line-height: 1.6; color: #FFFFFF; margin: 0 0 16px 0;">
                Welcome, {client_name}
              </p>
              <p style="font-size: 14px; line-height: 1.8; color: #B3B3B3; margin: 0 0 28px 0;">
                It is our distinct privilege to confirm the activation of your {tier_display} {account_type_display} Account with NemiCapital International Bank. Your account has completed institutional verification and is authorized for treasury transfers, concierge wealth management, and global payments.
              </p>

              <!-- Account Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #121111; border: 1px solid #332F2F; border-radius: 6px; padding: 24px; margin-bottom: 24px;">
                <tr>
                  <td style="padding-bottom: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <div style="font-size: 11px; color: #777777; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">ACCOUNT HOLDER</div>
                    <div style="font-size: 15px; font-weight: 700; color: #FFFFFF;">{client_name}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <div style="font-size: 11px; color: #777777; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">ACCOUNT NUMBER</div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 17px; font-weight: 700; color: #FFFFFF;">{account_number} ({masked_account})</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <div style="font-size: 11px; color: #777777; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">ROUTING / ABA NUMBER</div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700; color: #B81446;">{routing_number}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <div style="font-size: 11px; color: #777777; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">CLASSIFICATION & MEMBERSHIP</div>
                    <div style="font-size: 13px; font-weight: 600; color: #FFFFFF;">{tier_display} • {account_type_display}</div>
                  </td>
                </tr>
                {balance_row}
              </table>

              {credentials_section}

              <p style="font-size: 13px; line-height: 1.7; color: #888888; margin: 0 0 24px 0;">
                Your dedicated Relationship Executive is on standby. You may log in to review portfolio balances, order physical metal debit cards, or initiate real-time Fedwire transfers.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: #B81446;">
                    <a href="https://nemicapbank.com/dashboard" target="_blank" style="font-size: 13px; font-weight: 700; letter-spacing: 0.05em; color: #FFFFFF; text-decoration: none; padding: 14px 28px; display: inline-block;">
                      ACCESS PRIVATE WEALTH PORTAL
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #141313; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <p style="font-size: 11px; line-height: 1.6; color: #555555; margin: 0;">
                © 2026 NemiCapital International Bank. Member FDIC. Equal Housing Lender.<br>
                For direct client support, reply to this email or write to support@nemicapbank.com.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        """

        params = {
            "from": settings.EMAIL_FROM_WELCOME,
            "to": [recipient_email],
            "reply_to": settings.EMAIL_REPLY_TO,
            "subject": subject,
            "html": html_content,
        }

        return resend.Emails.send(params)

    @staticmethod
    def send_contact_inquiry(
        sender_name: str,
        sender_email: str,
        subject: str,
        message: str,
        inquiry_id: Optional[str] = None,
        phone: Optional[str] = None,
        delivery_destination: str = "support@nemicapital.com"
    ) -> dict:
        """
        Dispatches a high-priority Client Support inquiry directly to support@nemicapital.com.
        Reply-To is configured to the client's direct email for rapid response.
        """
        email_subject = f"[Support Inquiry] {subject} — {sender_name}"

        phone_html = f"""
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <div style="font-size: 10px; color: #777777; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px;">PHONE NUMBER</div>
                    <div style="font-size: 14px; font-weight: 600; color: #FFFFFF;">{phone}</div>
                  </td>
                </tr>""" if phone else ""

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{email_subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F0E0E; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0F0E0E; width: 100%; height: 100%;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px; width: 100%; background-color: #1A1818; border: 1px solid rgba(255, 255, 255, 0.08); border-top: 4px solid #B81446; border-radius: 8px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: #B81446; text-transform: uppercase; margin-bottom: 6px;">
                NEMICAPITAL CLIENT SUPPORT
              </div>
              <div style="font-size: 20px; font-weight: 800; color: #FFFFFF;">
                New Customer Support Inquiry
              </div>
            </td>
          </tr>

          <!-- Sender Meta -->
          <tr>
            <td style="padding: 28px 36px 16px 36px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #121111; border: 1px solid #2B2628; border-radius: 6px; padding: 20px;">
                <tr>
                  <td style="padding-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <div style="font-size: 10px; color: #777777; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px;">CLIENT SENDER</div>
                    <div style="font-size: 15px; font-weight: 700; color: #FFFFFF;">{sender_name}</div>
                  </td>
                </tr>{phone_html}
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <div style="font-size: 10px; color: #777777; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px;">REPLY-TO EMAIL</div>
                    <div style="font-size: 14px; font-weight: 600; color: #B81446;">{sender_email}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 10px;">
                    <div style="font-size: 10px; color: #777777; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px;">SUBJECT CATEGORY</div>
                    <div style="font-size: 14px; font-weight: 600; color: #E5E5E5;">{subject}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>


          <!-- Message Body -->
          <tr>
            <td style="padding: 16px 36px 28px 36px;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; color: #888888; text-transform: uppercase; margin-bottom: 10px;">
                INQUIRY MESSAGE CONTENT
              </div>
              <div style="background-color: #0F0E0E; border: 1px solid #332E30; border-radius: 6px; padding: 20px; font-size: 14px; line-height: 1.7; color: #EDEDED; white-space: pre-wrap;">
{message}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; background-color: #141313; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <p style="font-size: 11px; line-height: 1.6; color: #666666; margin: 0;">
                Delivered automatically to <strong style="color: #999;">{delivery_destination}</strong> via NemiCapital Executive Secure Gateway.<br>
                Inquiry ID: {inquiry_id or 'NEMI-INQ-LIVE'}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        """

        params = {
            "from": settings.EMAIL_FROM_WELCOME,
            "to": [delivery_destination],
            "reply_to": sender_email,
            "subject": email_subject,
            "html": html_content,
        }

        try:
            if settings.RESEND_API_KEY:
                return resend.Emails.send(params)
            else:
                print(f"[EmailService] Simulated delivery to {delivery_destination}: {email_subject}")
                return {"id": "simulated_concierge_id", "status": "delivered"}
        except Exception as e:
            print(f"[EmailService] Failed to deliver via Resend to {delivery_destination}: {e}")
            return {"error": str(e), "status": "logged_to_db"}


