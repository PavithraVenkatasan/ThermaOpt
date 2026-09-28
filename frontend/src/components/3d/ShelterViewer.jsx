import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  PerspectiveCamera,
  Environment,
} from "@react-three/drei";
import { useRef } from "react";

// --- Materials helper ---
const getMaterialColor = (matName, isRoof = false) => {
  const name = matName.toLowerCase();
  if (name.includes("stone")) return "#9ca3af"; // slate-400
  if (name.includes("brick")) return "#b91c1c"; // red-700
  if (name.includes("concrete")) return "#d1d5db"; // gray-300
  if (name.includes("metal")) return "#64748b"; // slate-500
  if (name.includes("wood")) return "#a16207"; // yellow-700
  if (name.includes("glass")) return "#bae6fd"; // sky-200
  return isRoof ? "#475569" : "#e5e7eb"; // slate-600 or gray-200
};

// --- Thermal Indicators ---
function ThermalIndicators({ showSolar = true, showHeatLoss = true, dimensions }) {
  const { height, width } = dimensions;
  
  return (
    <group>
      {/* Solar Radiation Arrows pointing towards South (+Z) */}
      {showSolar && (
        <group position={[0, height / 2, width / 2 + 1.5]}>
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0, 0.1, 0.5, 8]} />
            <meshBasicMaterial color="#f59e0b" opacity={0.6} transparent />
          </mesh>
          <mesh position={[0, 0, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
            <meshBasicMaterial color="#f59e0b" opacity={0.6} transparent />
          </mesh>
        </group>
      )}

      {/* Heat Loss Arrows pointing outwards from Roof (+Y) */}
      {showHeatLoss && (
        <group position={[0, height + 1.5, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0, 0.1, 0.5, 8]} />
            <meshBasicMaterial color="#ef4444" opacity={0.5} transparent />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
            <meshBasicMaterial color="#ef4444" opacity={0.5} transparent />
          </mesh>
        </group>
      )}
    </group>
  );
}

function RectangularShelter({ length, width, height, wallColor, roofColor, insulThick, winArea, doorArea }) {
  // Convert insulation thickness from inch to meters approximately for visualization scaling
  const iThick = Math.min(insulThick * 0.0254 * 2, 0.3); 
  const wallThick = 0.2;
  const innerWallThick = wallThick - 0.05;

  // Window geometry based on area
  const wWidth = Math.min(Math.sqrt(winArea * 1.5), length * 0.7);
  const wHeight = Math.min(winArea / wWidth, height * 0.7);

  // Door geometry
  const dWidth = Math.min(Math.sqrt(doorArea * 0.5), width * 0.5);
  const dHeight = Math.min(doorArea / dWidth, height * 0.85);

  return (
    <group>
      {/* Insulated Floor Base */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[length + 0.1, 0.2, width + 0.1]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>
      {/* Inner Floor */}
      <mesh position={[0, 0.205, 0]}>
        <boxGeometry args={[length - 0.1, 0.01, width - 0.1]} />
        <meshStandardMaterial color="#d4d4d8" />
      </mesh>

      {/* Walls */}
      {/* Back Wall (-Z) */}
      <mesh position={[0, height / 2 + 0.2, -width / 2]}>
        <boxGeometry args={[length, height, wallThick]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      
      {/* Front Wall (+Z) with Solar Window */}
      <mesh position={[0, height / 2 + 0.2, width / 2]}>
        <boxGeometry args={[length, height, wallThick]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      {/* Window cut visual on Front Wall */}
      <mesh position={[0, height / 2 + 0.2, width / 2 + wallThick/2 + 0.01]}>
        <boxGeometry args={[wWidth, wHeight, 0.02]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.6} roughness={0.1} />
      </mesh>

      {/* Left Wall (-X) */}
      <mesh position={[-length / 2, height / 2 + 0.2, 0]}>
        <boxGeometry args={[wallThick, height, width]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      
      {/* Right Wall (+X) with Door */}
      <mesh position={[length / 2, height / 2 + 0.2, 0]}>
        <boxGeometry args={[wallThick, height, width]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      {/* Door cut visual on Right Wall */}
      <mesh position={[length / 2 + wallThick/2 + 0.01, dHeight / 2 + 0.2, 0]}>
        <boxGeometry args={[0.02, dHeight, dWidth]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>

      {/* Insulation Layer (visible as inner rim) */}
      {iThick > 0 && (
        <mesh position={[0, height + 0.19, 0]}>
          <boxGeometry args={[length - innerWallThick, 0.05, width - innerWallThick]} />
          <meshStandardMaterial color="#fef08a" /> {/* Yellowish foam look */}
        </mesh>
      )}

      {/* Roof (Slight slope) */}
      <mesh position={[0, height + 0.3, 0]} rotation={[-0.05, 0, 0]}>
        <boxGeometry args={[length + 0.4, 0.15, width + 0.6]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
    </group>
  );
}

function AFrameShelter({ length, width, height, wallColor, roofColor, insulThick, winArea, doorArea }) {
  // A-Frame with triangles on +Z and -Z faces.
  // Base of triangle = length (along X). Depth = width (along Z).
  const slantLength = Math.sqrt(height * height + (length / 2) ** 2);
  const tiltAngle = Math.atan2(length / 2, height);
  const iThick = Math.min(insulThick * 0.0254 * 2, 0.3);

  const wWidth = Math.min(Math.sqrt(winArea * 1.5), length * 0.5);
  const wHeight = Math.min(winArea / wWidth, height * 0.4);
  const dWidth = Math.min(Math.sqrt(doorArea * 0.5), length * 0.4);
  const dHeight = Math.min(doorArea / dWidth, height * 0.6);

  return (
    <group>
      {/* Floor Base */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[length + 0.2, 0.2, width + 0.2]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>
      
      {/* Front Wall Triangle (+Z) */}
      {/* A cylinder with 4 segments rotated 45deg is a square pyramid. 
          To make it a flat triangle spanning X, scale X to base, Y to height, Z to thin.
          Base = length. The diagonal of base square is 2 * radius.
          So radius = length / 2. But we rotate it, so width across is sqrt(2) * radius.
          Let's just use a radius of length / Math.sqrt(2). */}
      <mesh position={[0, height / 2 + 0.2, width / 2]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 0.05]}>
        <cylinderGeometry args={[0, length / Math.sqrt(2), height, 4]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      
      {/* Window cut visual on Front Triangle */}
      <mesh position={[0, wHeight / 2 + 0.3, width / 2 + 0.05]}>
        <boxGeometry args={[wWidth, wHeight, 0.05]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.6} roughness={0.1} />
      </mesh>
      
      {/* Door cut visual on Front Triangle */}
      <mesh position={[0, dHeight / 2 + 0.2, width / 2 + 0.05]}>
        <boxGeometry args={[dWidth, dHeight, 0.06]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>

      {/* Back Wall Triangle (-Z) */}
      <mesh position={[0, height / 2 + 0.2, -width / 2]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 0.05]}>
        <cylinderGeometry args={[0, length / Math.sqrt(2), height, 4]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* Insulation indicator (yellow edge on front/back) */}
      {iThick > 0 && (
         <mesh position={[0, height / 2 + 0.2, width / 2 - 0.05]} rotation={[0, Math.PI / 4, 0]} scale={[0.95, 0.95, 0.05]}>
           <cylinderGeometry args={[0, length / Math.sqrt(2), height, 4]} />
           <meshStandardMaterial color="#fef08a" />
         </mesh>
      )}

      {/* Left Roof Slant (facing -X) */}
      {/* Slants along X. Center at X = -length/4, Y = height/2. */}
      {/* Needs +Y to point towards origin (tilt toward +X), so rotation is -tiltAngle */}
      <mesh
        position={[-length / 4, height / 2 + 0.2, 0]}
        rotation={[0, 0, -tiltAngle]}
      >
        <boxGeometry args={[0.15, slantLength, width + 0.4]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>

      {/* Right Roof Slant (facing +X) */}
      {/* Center at X = length/4, Y = height/2. */}
      {/* Needs +Y to point towards origin (tilt toward -X), so rotation is +tiltAngle */}
      <mesh
        position={[length / 4, height / 2 + 0.2, 0]}
        rotation={[0, 0, tiltAngle]}
      >
        <boxGeometry args={[0.15, slantLength, width + 0.4]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
    </group>
  );
}

function DomeShelter({ length, width, height, wallColor }) {
  // Dome must stay intact geometry-wise, just color and base adjustment.
  return (
    <group>
      {/* Floor Base */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[length + 0.2, 0.2, width + 0.2]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>

      {/* Dome Shell */}
      <mesh position={[0, 0.2, 0]} scale={[length / 2, height, width / 2]}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* Simple Door Indication */}
      <mesh position={[0, height * 0.35 + 0.2, width / 2]}>
        <boxGeometry args={[1.2, height * 0.7, 0.2]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
    </group>
  );
}

function ShelterModel({ type, length, width, height, wallColor, roofColor, insulThick, winArea, doorArea }) {
  if (type === "A-frame") {
    return <AFrameShelter length={length} width={width} height={height} wallColor={wallColor} roofColor={roofColor} insulThick={insulThick} winArea={winArea} doorArea={doorArea} />;
  }

  if (type === "Dome") {
    return <DomeShelter length={length} width={width} height={height} wallColor={wallColor} />;
  }

  return <RectangularShelter length={length} width={width} height={height} wallColor={wallColor} roofColor={roofColor} insulThick={insulThick} winArea={winArea} doorArea={doorArea} />;
}

export default function ShelterViewer({
  type = "Rectangular",
  length = 8,
  width = 5,
  height = 3,
  orientation = "South",
  wallMaterial = "Standard Wall",
  roofMaterial = "Standard Roof",
  insulation = "None",
  insulationThickness = 2,
  windowArea = 2,
  doorArea = 2,
}) {
  const controlsRef = useRef();

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const wallColor = getMaterialColor(wallMaterial, false);
  const roofColor = getMaterialColor(roofMaterial, true);

  // Map orientation to Y rotation (South faces +Z which is default 0 rotation)
  let rotY = 0;
  if (orientation === "North") rotY = Math.PI;
  if (orientation === "East") rotY = Math.PI / 2;
  if (orientation === "West") rotY = -Math.PI / 2;

  // Camera framing based on max dimension
  const maxDim = Math.max(length, width, height);
  const camDist = maxDim * 1.8;

  return (
    <div className="relative w-full h-[550px] bg-slate-50 border border-slate-300">
      
      {/* HTML Legend Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur border border-slate-200 p-3 text-xs shadow-sm w-48">
        <h4 className="font-semibold text-slate-800 mb-2 border-b border-slate-200 pb-1">THERMAL SHELTER</h4>
        <ul className="space-y-1 text-slate-600">
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{backgroundColor: wallColor}}></span> Insulated Wall ({wallMaterial})</li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{backgroundColor: roofColor}}></span> Roof ({roofMaterial})</li>
          {insulation !== "None" && <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-200"></span> Core ({insulation})</li>}
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-200"></span> Solar Window</li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-zinc-700"></span> Insulated Base</li>
        </ul>
      </div>

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[camDist, camDist * 0.7, camDist]} fov={45} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
        <Environment preset="city" />

        <Grid args={[30, 30]} cellSize={1} cellThickness={0.5} sectionSize={5} sectionThickness={1} fadeDistance={30} infiniteGrid />

        <group rotation={[0, rotY, 0]}>
          <ShelterModel 
            type={type} 
            length={length} 
            width={width} 
            height={height} 
            wallColor={wallColor}
            roofColor={roofColor}
            insulThick={insulationThickness}
            winArea={windowArea}
            doorArea={doorArea}
          />
          <ThermalIndicators dimensions={{length, width, height}} />
        </group>

        <OrbitControls ref={controlsRef} enableDamping minDistance={maxDim} maxDistance={maxDim * 4} target={[0, height / 2, 0]} />
      </Canvas>

      {/* Compass */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur border border-slate-300 px-4 py-3 text-xs text-slate-600 shadow-sm rounded">
        <div className="text-center font-semibold text-slate-800">N</div>
        <div className="flex gap-5 my-1">
          <span className="font-semibold text-slate-800">W</span>
          <span className="text-red-500">●</span>
          <span className="font-semibold text-slate-800">E</span>
        </div>
        <div className="text-center font-semibold text-slate-800">S</div>
      </div>

      {/* Dimensions Info Panel */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur border border-slate-300 px-4 py-3 text-xs shadow-sm rounded flex gap-6">
        <div><span className="text-slate-500 block text-[10px]">LENGTH</span><strong className="text-slate-800 text-sm">{length} m</strong></div>
        <div><span className="text-slate-500 block text-[10px]">WIDTH</span><strong className="text-slate-800 text-sm">{width} m</strong></div>
        <div><span className="text-slate-500 block text-[10px]">HEIGHT</span><strong className="text-slate-800 text-sm">{height} m</strong></div>
      </div>

      {/* Reset */}
      <button onClick={resetCamera} className="absolute bottom-4 right-4 bg-slate-900 text-white px-4 py-2 text-xs font-medium hover:bg-slate-800 shadow-sm rounded">
        Reset View
      </button>
    </div>
  );
}