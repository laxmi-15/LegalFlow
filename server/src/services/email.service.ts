import { DBService } from "./db.service";

export interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
}

export const EmailService = {
  /**
   * Send an email using Resend, fallback to mock console log if not configured
   */
  async sendEmail(payload: EmailPayload, intakeId?: string, isClientConfirmation?: boolean): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    const recipient = payload.to;
    
    console.log(`\n--- [EMAIL DISPATCH LOG] ---`);
    console.log(`To: ${recipient}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Content Preview:`);
    console.log(payload.htmlContent.replace(/<[^>]*>/g, " ").substring(0, 300) + "...");
    console.log(`----------------------------\n`);

    let sentSuccessfully = false;
    let errorMessage: string | null = null;

    if (apiKey && apiKey.trim().length > 0 && apiKey !== "your_resend_api_key_here") {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "LegalFlow Notifications <onboarding@resend.dev>",
            to: recipient,
            subject: payload.subject,
            html: payload.htmlContent,
          }),
        });

        if (response.ok) {
          sentSuccessfully = true;
          console.log(`[EmailService] Resend dispatched email successfully to: ${recipient}`);
        } else {
          const errText = await response.text();
          errorMessage = `Status: ${response.status}. Error: ${errText}`;
          console.error(`[EmailService] Resend dispatch failed: ${errorMessage}`);

          // Self-healing fallback for Resend Sandbox/Free Tier restrictions (only for internal staff, not client emails)
          if (!isClientConfirmation && response.status === 403 && errText.includes("You can only send testing emails to your own email address")) {
            const match = errText.match(/own email address \(([^)]+)\)/);
            const verifiedEmail = match ? match[1] : null;

            if (verifiedEmail && verifiedEmail.toLowerCase() !== recipient.toLowerCase()) {
              console.log(`[EmailService] 🔄 Resend Sandbox constraint detected. Retrying dispatch to verified owner: ${verifiedEmail}`);
              try {
                const retryResponse = await fetch("https://api.resend.com/emails", {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    from: "LegalFlow Notifications <onboarding@resend.dev>",
                    to: verifiedEmail,
                    subject: `[Sandbox Route for ${recipient}] ${payload.subject}`,
                    html: payload.htmlContent,
                  }),
                });

                if (retryResponse.ok) {
                  sentSuccessfully = true;
                  errorMessage = null; // Clear error
                  console.log(`[EmailService] ✅ Sandbox fallback email sent successfully to verified owner: ${verifiedEmail}`);
                } else {
                  const retryErrText = await retryResponse.text();
                  errorMessage = `Fallback failed. Status: ${retryResponse.status}. Error: ${retryErrText}`;
                  console.error(`[EmailService] Fallback dispatch also failed: ${errorMessage}`);
                }
              } catch (retryErr) {
                errorMessage = `Fallback exception: ${(retryErr as Error).message}`;
                console.error("[EmailService] Exception during fallback dispatch:", retryErr);
              }
            }
          }
        }
      } catch (err) {
        errorMessage = (err as Error).message;
        console.error("[EmailService] Exception during email dispatch:", err);
      }
    } else {
      // Mock mode
      sentSuccessfully = true;
      console.log("[EmailService] Resend API Key is not configured. Logged notification to console in development mock mode.");
    }

    // Save notification status in Database
    if (intakeId) {
      try {
        await DBService.createNotification({
          intakeId,
          type: "EMAIL",
          status: sentSuccessfully ? "SENT" : "FAILED",
          recipient,
          errorMessage,
        });
      } catch (dbErr) {
        console.warn("[EmailService] Deferred logging email status to database (DB fallback active).");
      }
    }

    return sentSuccessfully;
  },

  /**
   * Build email template for internal law firm staff
   */
  buildInternalTemplate(intake: any, teamName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EBE7E0; background-color: #FAF9F6; color: #1C1A17;">
        <h2 style="border-bottom: 2px solid #1A365D; padding-bottom: 10px; color: #1A365D;">NEW CLIENT INTAKE QUALIFIED</h2>
        <p>A new intake has been analyzed by LegalFlow and routed to your department.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #EBE7E0; font-weight: bold; width: 35%;">Reference ID:</td>
            <td style="padding: 8px; border-bottom: 1px solid #EBE7E0;">${intake.referenceId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #EBE7E0; font-weight: bold;">Practice Area:</td>
            <td style="padding: 8px; border-bottom: 1px solid #EBE7E0;"><span style="background-color: rgba(26,54,93,0.1); padding: 3px 8px; border-radius: 4px; font-weight: bold; color: #1A365D;">${intake.practiceArea}</span></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #EBE7E0; font-weight: bold;">Priority Urgency:</td>
            <td style="padding: 8px; border-bottom: 1px solid #EBE7E0; color: ${intake.urgency === 'HIGH' ? '#991B1B' : '#1C1A17'}; font-weight: bold;">${intake.urgency} (Score: ${intake.urgencyScore}/100)</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #EBE7E0; font-weight: bold;">Client Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #EBE7E0;">${intake.clientName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #EBE7E0; font-weight: bold;">Location:</td>
            <td style="padding: 8px; border-bottom: 1px solid #EBE7E0;">${intake.clientLocation || "Not specified"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #EBE7E0; font-weight: bold;">Assigned Team:</td>
            <td style="padding: 8px; border-bottom: 1px solid #EBE7E0;">${teamName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #EBE7E0; font-weight: bold;">Lead Attorney:</td>
            <td style="padding: 8px; border-bottom: 1px solid #EBE7E0;">${intake.assignedAttorney || "TBD"}</td>
          </tr>
        </table>

        <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #EBE7E0; margin-bottom: 20px;">
          <h4 style="margin-top: 0; color: #1A365D;">AI Case Summary</h4>
          <p style="font-style: italic; line-height: 1.5; font-size: 14px;">"${intake.summary}"</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:3000/admin?id=${intake.id}" style="background-color: #1A365D; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Case in Command Center</a>
        </div>
        
        <p style="font-size: 11px; color: #8C867E; text-align: center; margin-top: 30px; border-top: 1px solid #EBE7E0; padding-top: 10px;">
          This is an automated operational routing dispatch. Confidential client information is subject to attorney-client privilege.
        </p>
      </div>
    `;
  },

  /**
   * Build email template for the client
   */
  buildClientConfirmationTemplate(intake: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EBE7E0; background-color: #FAF9F6; color: #1C1A17;">
        <h2 style="color: #1A365D; text-align: center;">LegalFlow</h2>
        <p>Dear ${intake.clientName},</p>
        <p>Thank you for submitting your inquiry. We have successfully received and securely recorded your intake details.</p>
        
        <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #EBE7E0; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #1A365D;">Submission Reference: ${intake.referenceId}</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #5F5B54;">Status: Received & Routed for Review</p>
        </div>

        <p>What happens next?</p>
        <ol style="line-height: 1.6;">
          <li>Your inquiry is being routed to our <strong>${intake.practiceArea}</strong> department.</li>
          <li>A qualified legal professional will review the summary of facts you provided.</li>
          <li>We will contact you directly within 1 business day at the email or phone number you supplied.</li>
        </ol>

        <blockquote style="border-left: 3px solid #3F5144; padding-left: 15px; margin: 20px 0; color: #5F5B54; font-size: 13.5px; font-style: italic;">
          <strong>Confidentiality Notice:</strong> The information you submitted is protected under confidentiality protocols and will only be shared with attorneys evaluating your potential matter. This assistant collects intake details and does not constitute formal legal representation or legal advice.
        </blockquote>

        <p>Sincerely,</p>
        <p><strong>LegalFlow Intake Department</strong></p>
      </div>
    `;
  }
};
