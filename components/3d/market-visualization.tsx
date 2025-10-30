"use client"

import { useRef, useState, useEffect } from "react"
import { Mesh } from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, Float, Text, Html, PresentationControls, ContactShadows } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

const stockData = [
  { symbol: "RELIANCE", price: 2456.75, change: +1.87, color: "#22c55e" },
  { symbol: "TCS", price: 3789.3, change: -0.61, color: "#ef4444" },
  { symbol: "HDFCBANK", price: 1678.9, change: +0.74, color: "#22c55e" },
  { symbol: "INFY", price: 1456.2, change: +0.62, color: "#22c55e" },
  { symbol: "ICICIBANK", price: 987.65, change: -0.55, color: "#ef4444" },
]

function StockCube({
  position,
  stock,
  index,
}: {
  position: [number, number, number]
  stock: { symbol: string; price: number; change: number; color: string }
  index: number
}) {
  const ref = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.005
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.1
    }
  })

  const isPositive = stock.change > 0

  return (
    <group position={position}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh
          ref={ref}
          scale={clicked ? 1.2 : hovered ? 1.1 : 1}
          onClick={() => setClicked(!clicked)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={stock.color}
            metalness={0.3}
            roughness={0.4}
            emissive={hovered ? stock.color : "#000000"}
            emissiveIntensity={hovered ? 0.2 : 0}
            transparent
            opacity={0.8}
          />
          <Html position={[0, 0, 0.51]} transform occlude>
            <div
              className={`px-3 py-2 rounded-lg ${isPositive ? "bg-green-500/90" : "bg-red-500/90"} text-white text-xs font-bold shadow-lg`}
            >
              {stock.symbol}
            </div>
          </Html>
        </mesh>
      </Float>

      {clicked && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-white/90 dark:bg-gray-900/90 p-4 rounded-lg shadow-xl backdrop-blur-sm border border-green-200 dark:border-green-800 min-w-[180px]">
            <div className="font-bold text-lg">{stock.symbol}</div>
            <div className="text-xl font-bold">₹{stock.price.toFixed(2)}</div>
            <div className={`flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {isPositive ? "+" : ""}
              {stock.change}%
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

function MarketFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#10b981" opacity={0.1} transparent roughness={0.9} />
    </mesh>
  )
}

function StockChart({
  position,
  width = 5,
  height = 2,
  data = [],
}: {
  position: [number, number, number]
  width?: number
  height?: number
  data?: number[]
}) {
  const points: [number, number, number][] = data.map((value, i) => [(i / (data.length - 1)) * width - width / 2, value * height, 0])

  return (
    <group position={position}>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(points.flat()), 3]}
            count={points.length}
            array={new Float32Array(points.flat())}
            itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#22c55e" linewidth={2} />
      </line>
      {points.map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
      ))}
    </group>
  )
}

function Scene() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 2, 10)
  }, [camera])

  const chartData = [0.2, 0.4, 0.3, 0.5, 0.6, 0.4, 0.7, 0.8, 0.6, 0.9]

  return (
    <>
      <Environment preset="city" background={false} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} castShadow />

      <PresentationControls
        global
        zoom={0.8}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Math.PI / 4, Math.PI / 4]}
      >
        <group position={[0, 0, 0]}>
          <Text
            position={[0, 3, 0]}
            fontSize={1}
            color="#22c55e"
            font="/fonts/Inter_Bold.json"
            anchorX="center"
            anchorY="middle"
          >
            StockFlow Market
          </Text>

          <StockChart position={[0, 0, -3]} data={chartData} />

          {stockData.map((stock, index) => (
            <StockCube
              key={stock.symbol}
              position={[(index - stockData.length / 2 + 0.5) * 2, 0, 0]}
              stock={stock}
              index={index}
            />
          ))}

          <MarketFloor />
        </group>
      </PresentationControls>

      <ContactShadows position={[0, -2, 0]} opacity={0.2} scale={20} blur={2} />
    </>
  )
}

export default function MarketVisualization() {
  return (
    <div className="relative w-full h-[400px] bg-gradient-to-b from-green-50/30 to-emerald-50/30 dark:from-gray-900/30 dark:to-gray-800/30 rounded-xl overflow-hidden border border-green-100/30 dark:border-green-900/20 shadow-lg">
      <Canvas shadows>
        <Scene />
      </Canvas>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <Badge variant="outline" className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          Interactive 3D Market View
        </Badge>
        <div className="text-xs text-gray-500 dark:text-gray-400">Drag to rotate • Scroll to zoom</div>
      </div>
    </div>
  )
}
