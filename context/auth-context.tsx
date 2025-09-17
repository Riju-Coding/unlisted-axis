"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { collection, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

type UserRole = "admin" | "user" | null

interface AuthContextType {
  user: User | null
  role: UserRole
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        try {
          // Query the 'roles' collection for a document where the 'uid' field matches currentUser.uid
          const rolesRef = collection(db, "roles")
          const q = query(rolesRef, where("uid", "==", currentUser.uid))
          const querySnapshot = await getDocs(q)

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data()
            setRole(userData.role as UserRole)
          } else {
            setRole("user") // Default to 'user' if no role document is found for this UID
            console.warn("No role document found for user UID:", currentUser.uid, "Defaulting to 'user'.")
          }
        } catch (error) {
          console.error("Error fetching user role in AuthProvider:", error)
          setRole("user") // Fallback to user role on error
        }
      } else {
        setUser(null)
        setRole(null)
      }

      // Set loading to false immediately after auth check
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, role, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
