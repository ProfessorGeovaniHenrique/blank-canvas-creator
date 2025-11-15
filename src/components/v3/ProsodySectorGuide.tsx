import { Line } from '@react-three/drei';

/**
 * Guia visual mostrando as 6 camadas orbitais e setores de prosódia
 */
export function ProsodySectorGuide({ visible = false }: { visible?: boolean }) {
  if (!visible) return null;
  
  // 6 camadas orbitais discretas
  const orbitalLayers = [2.0, 2.6, 3.2, 3.8, 4.4, 5.0];
  
  return (
    <group>
      {/* Círculos das 6 camadas orbitais */}
      {orbitalLayers.map((radius, idx) => (
        <mesh key={idx} rotation-x={Math.PI / 2} position={[0, -0.01, 0]}>
          <ringGeometry args={[radius - 0.02, radius + 0.02, 64]} />
          <meshBasicMaterial 
            color="#00ffff" 
            opacity={0.15} 
            transparent 
          />
        </mesh>
      ))}
      
      {/* Linhas divisórias de setores de prosódia */}
      {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map((angle, idx) => {
        const colors = ['#4ade80', '#fbbf24', '#f87171'];
        const maxRadius = 5.2;
        return (
          <Line
            key={idx}
            points={[
              [0, 0, 0], 
              [maxRadius * Math.cos(angle), 0, maxRadius * Math.sin(angle)]
            ]}
            color={colors[idx]}
            lineWidth={1.5}
            opacity={0.3}
          />
        );
      })}
    </group>
  );
}
