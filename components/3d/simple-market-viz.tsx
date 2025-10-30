"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Text, Html, OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

const stockData = [
  { symbol: "RELIANCE", price: 2456.75, change: +1.87, color: "#22c55e" },
  { symbol: "TCS", price: 3789.3, change: -0.61, color: "#ef4444" },
  { symbol: "HDFCBANK", price: 1678.9, change: +0.74, color: "#22c55e" },
  { symbol: "INFY", price: 1456.2, change: +0.62, color: "#22c55e" },
]

function SimpleStockBar({
  position,
  stock,
  index,
}: {
  position: [number, number, number]
  stock: {
    symbol: string
    price: number
    change: number
    color: string
  }
  index: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3 + index) * 0.05
    }
  })

  const height = Math.abs(stock.change) * 0.5 + 0.5
  const isPositive = stock.change > 0

  return (
    <group position={position}>
      <mesh
        ref={ref}
        scale={[0.8, height, 0.8]}
        position={[0, height / 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={stock.color}
          transparent
          opacity={hovered ? 0.9 : 0.7}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {hovered && (
        <Html position={[0, height + 0.5, 0]} center>
          <div className="bg-white/95 dark:bg-gray-900/95 p-3 rounded-lg shadow-lg backdrop-blur-sm border border-green-200 dark:border-green-800 min-w-[140px] text-center">
            <div className="font-bold text-sm">{stock.symbol}</div>
            <div className="text-lg font-bold">₹{stock.price.toFixed(2)}</div>
            <div className={`flex items-center justify-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {isPositive ? "+" : ""}
              {stock.change}%
            </div>
          </div>
        </Html>
      )}

      <Html position={[0, -0.5, 0]} center>
        <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-900/80 px-2 py-1 rounded backdrop-blur-sm">
          {stock.symbol}
        </div>
      </Html>
    </group>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />

      <Text
        position={[0, 2, 0]}
        fontSize={0.5}
        color="#22c55e"
        font="/fonts/Inter_Bold.json"
        anchorX="center"
        anchorY="middle"
      >
        Market Performance
      </Text>

      {stockData.map((stock, index) => (
        <SimpleStockBar
          key={stock.symbol}
          position={[(index - stockData.length / 2 + 0.5) * 1.5, 0, 0]}
          stock={stock}
          index={index}
        />
      ))}

      <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

export default function SimpleMarketVisualization() {
  return (
    <div className="relative w-full h-[300px] bg-gradient-to-b from-green-50/20 to-emerald-50/20 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl overflow-hidden border border-green-100/30 dark:border-green-900/20 shadow-sm">
      <Canvas camera={{ position: [0, 1, 5], fov: 50 }}>
        <Scene />
      </Canvas>

      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
        <Badge variant="outline" className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs">
          Interactive Market View
        </Badge>
        <div className="text-xs text-gray-500 dark:text-gray-400">Hover to view details</div>
      </div>
    </div>
  )
}
