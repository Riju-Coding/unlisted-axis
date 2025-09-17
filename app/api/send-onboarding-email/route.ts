import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { getFirestore } from "firebase-admin/firestore"
import { initializeApp, getApps, cert } from "firebase-admin/app"

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
  } catch (error) {
    console.error("Firebase Admin initialization error:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, password } = await request.json()

    if (!email || !displayName || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get SMTP settings from Firestore
    const db = getFirestore()
    const settingsDoc = await db.collection("settings").doc("smtp").get()

    if (!settingsDoc.exists) {
      console.error("SMTP settings not found in Firestore")
      return NextResponse.json({ error: "SMTP settings not configured" }, { status: 500 })
    }

    const smtpSettings = settingsDoc.data()

    if (!smtpSettings) {
      console.error("SMTP settings data is empty")
      return NextResponse.json({ error: "SMTP settings not configured properly" }, { status: 500 })
    }

    console.log("Using SMTP settings:", {
      host: smtpSettings.host,
      port: smtpSettings.port,
      user: smtpSettings.user,
      fromEmail: smtpSettings.fromEmail,
      fromName: smtpSettings.fromName,
    })

    // Create transporter with your SMTP settings
    const transporter = nodemailer.createTransporter({
      host: smtpSettings.host,
      port: smtpSettings.port,
      secure: smtpSettings.secure || false,
      auth: {
        user: smtpSettings.user,
        pass: smtpSettings.password,
      },
    })

    // Verify SMTP connection
    try {
      await transporter.verify()
      console.log("SMTP connection verified successfully")
    } catch (verifyError) {
      console.error("SMTP verification failed:", verifyError)
      return NextResponse.json({ error: "SMTP configuration error" }, { status: 500 })
    }

    // Email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Unlisted Axis</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Unlisted Axis!</h1>
              <p>Your account has been created successfully</p>
            </div>
            <div class="content">
              <p>Hello ${displayName},</p>
              <p>Welcome to Unlisted Axis! Your account has been created and you can now access our platform.</p>
              
              <div class="credentials">
                <h3>Your Login Credentials:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
              </div>
              
              <p>For security reasons, we recommend changing your password after your first login.</p>
              
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/login" class="button">
                Login to Your Account
              </a>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>Best regards,<br>The Unlisted Axis Team</p>
            </div>
            <div class="footer">
              <p>This email was sent from Unlisted Axis. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const textContent = `
      Welcome to Unlisted Axis!
      
      Hello ${displayName},
      
      Your account has been created successfully. Here are your login credentials:
      
      Email: ${email}
      Password: ${password}
      
      You can login at: ${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/login
      
      For security reasons, we recommend changing your password after your first login.
      
      Best regards,
      The Unlisted Axis Team
    `

    // Send email using your SMTP settings
    const mailOptions = {
      from: `"${smtpSettings.fromName}" <${smtpSettings.fromEmail}>`,
      to: email,
      subject: "Welcome to Unlisted Axis - Your Account Details",
      text: textContent,
      html: htmlContent,
    }

    console.log("Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    })

    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", info.messageId)

    return NextResponse.json({
      success: true,
      message: "Onboarding email sent successfully",
      messageId: info.messageId,
    })
  } catch (error: any) {
    console.error("Error sending onboarding email:", error)
    return NextResponse.json({ error: "Failed to send onboarding email", details: error.message }, { status: 500 })
  }
}
