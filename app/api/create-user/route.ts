import { type NextRequest, NextResponse } from "next/server"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

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
    const body = await request.json()
    const { email, password, displayName, role = "user" } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const auth = getAuth()
    const db = getFirestore()

    // Check if user already exists
    try {
      await auth.getUserByEmail(email)
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    } catch (error: any) {
      // User doesn't exist, which is what we want
      if (error.code !== "auth/user-not-found") {
        throw error
      }
    }

    // Create user with Firebase Admin SDK
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: displayName || email.split("@")[0],
      emailVerified: false,
    })

    // Create user document in Firestore
    await db
      .collection("users")
      .doc(userRecord.uid)
      .set({
        email: email,
        displayName: displayName || email.split("@")[0],
        role: role,
        createdAt: new Date(),
        emailVerified: false,
        isActive: true,
      })

    // Send onboarding email
    try {
      const emailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/send-onboarding-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            displayName: displayName || email.split("@")[0],
            password: password,
          }),
        },
      )

      if (!emailResponse.ok) {
        console.error("Failed to send onboarding email:", await emailResponse.text())
      }
    } catch (emailError) {
      console.error("Error sending onboarding email:", emailError)
      // Don't fail user creation if email fails
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: role,
      },
    })
  } catch (error: any) {
    console.error("Error creating user:", error)

    // Handle specific Firebase errors
    if (error.code === "auth/email-already-exists") {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    if (error.code === "auth/invalid-email") {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    if (error.code === "auth/weak-password") {
      return NextResponse.json({ error: "Password is too weak" }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create user. Please try again." }, { status: 500 })
  }
}
