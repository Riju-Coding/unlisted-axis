"use client"
import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function ExportSharesJSON() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const snapshot = await getDocs(collection(db, "shares"))
        const arr = []
        snapshot.forEach((doc) => {
          arr.push({ id: doc.id, ...doc.data() })
        })
        setData(arr)
      } catch (err) {
        console.error("Error fetching documents:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div style={{ padding: 20 }}>
      <h2>All Shares JSON</h2>
      <pre style={{
        background: "#111",
        color: "#0f0",
        padding: "15px",
        borderRadius: "10px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word"
      }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
