
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Vector3, MathUtils } from 'three';
import { PetAction } from '../types';

interface VoxelCatProps {
  action: PetAction;
  navigation: { x: number; z: number };
}

const CAT_PINK = "#ffb7b2";
const CAT_WHITE = "#ffffff";
const CAT_DARK = "#4a4a4a";
const MOVE_SPEED = 2.0;

export const VoxelCat: React.FC<VoxelCatProps> = ({ action, navigation }) => {
  const group = useRef<Group>(null);
  const head = useRef<Mesh>(null);
  const body = useRef<Mesh>(null);
  const legFL = useRef<Mesh>(null); // Front Left
  const legFR = useRef<Mesh>(null); // Front Right
  const legBL = useRef<Mesh>(null); // Back Left
  const legBR = useRef<Mesh>(null); // Back Right
  const tail = useRef<Mesh>(null);

  // Position state (persisted across frames)
  const currentPos = useRef(new Vector3(0, 0, 0));
  const currentRot = useRef(0);

  useFrame((state, delta) => {
    if (!group.current || !head.current || !body.current) return;

    const time = state.clock.getElapsedTime();

    // Helper for walking animation
    const animateWalk = () => {
        // Animation (Bob & Legs)
        if(group.current) group.current.position.y = Math.abs(Math.sin(time * 8)) * 0.1;
        
        if (legFL.current) legFL.current.rotation.x = Math.sin(time * 12) * 0.6;
        if (legFR.current) legFR.current.rotation.x = Math.cos(time * 12) * 0.6;
        if (legBL.current) legBL.current.rotation.x = Math.cos(time * 12) * 0.6;
        if (legBR.current) legBR.current.rotation.x = Math.sin(time * 12) * 0.6;
        
        if (tail.current) tail.current.rotation.z = Math.cos(time * 6) * 0.3;
    };

    const resetLimbs = () => {
        if(legFL.current) legFL.current.rotation.x = 0;
        if(legFR.current) legFR.current.rotation.x = 0;
        if(legBL.current) legBL.current.rotation.x = 0;
        if(legBR.current) legBR.current.rotation.x = 0;
    }

    // --- ANIMATIONS BASED ON ACTION ---

    if (action === PetAction.IDLE) {
      // Breathing
      group.current.position.y = currentPos.current.y + Math.sin(time * 2) * 0.05;
      head.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      if (tail.current) tail.current.rotation.z = Math.sin(time * 3) * 0.2;
      resetLimbs();
    }

    else if (action === PetAction.WALK) {
      // 1. Calculate Movement
      const hasInput = Math.abs(navigation.x) > 0.1 || Math.abs(navigation.z) > 0.1;
      
      if (hasInput) {
          // Update Position
          currentPos.current.x += navigation.x * MOVE_SPEED * delta;
          currentPos.current.z += navigation.z * MOVE_SPEED * delta;

          // Calculate Target Rotation
          const targetRotation = Math.atan2(navigation.x, navigation.z);
          
          // Smooth rotation (Lerp)
          let rotDiff = targetRotation - currentRot.current;
          while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
          while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
          
          currentRot.current += rotDiff * delta * 5; 
      }

      // 2. Apply Position & Rotation
      group.current.position.x = currentPos.current.x;
      group.current.position.z = currentPos.current.z;
      group.current.rotation.y = currentRot.current;

      animateWalk();
    }

    else if (action === PetAction.CALL) {
        // Move towards origin (0,0,0)
        const targetX = 0;
        const targetZ = 0;
        const dx = targetX - currentPos.current.x;
        const dz = targetZ - currentPos.current.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        // Only move if we aren't already very close
        if (dist > 0.2) {
            const dirX = dx / dist;
            const dirZ = dz / dist;
            
            // Move
            currentPos.current.x += dirX * MOVE_SPEED * 1.5 * delta; // Run faster when called
            currentPos.current.z += dirZ * MOVE_SPEED * 1.5 * delta;

            // Rotate towards home
            const targetRotation = Math.atan2(dirX, dirZ);
            let rotDiff = targetRotation - currentRot.current;
            while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
            while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
            currentRot.current += rotDiff * delta * 5;

            animateWalk();
            // Faster ear wiggle when called
            if (tail.current) tail.current.rotation.z = Math.sin(time * 15) * 0.5;
        } else {
            // Arrived
            resetLimbs();
            // Look up at user
            head.current.rotation.x = -0.3;
        }

        group.current.position.x = currentPos.current.x;
        group.current.position.z = currentPos.current.z;
        group.current.rotation.y = currentRot.current;
    }

    else if (action === PetAction.JUMP) {
        // Simple physics-ish jump loop relative to current pos
        group.current.position.y = Math.abs(Math.sin(time * 10)) * 1.5;
        // Legs splayed
        const legAngle = -0.5;
        if (legFL.current) legFL.current.rotation.x = -legAngle;
        if (legFR.current) legFR.current.rotation.x = -legAngle;
        if (legBL.current) legBL.current.rotation.x = legAngle;
        if (legBR.current) legBR.current.rotation.x = legAngle;
        
        // Keep X/Z position
        group.current.position.x = currentPos.current.x;
        group.current.position.z = currentPos.current.z;
    }

    else if (action === PetAction.SIT) {
        group.current.position.x = currentPos.current.x;
        group.current.position.z = currentPos.current.z;
        group.current.position.y = -0.3;
        
        group.current.rotation.x = -0.2;
        if (legBL.current) legBL.current.rotation.x = -1.5; // Fold back legs
        if (legBR.current) legBR.current.rotation.x = -1.5;
        if (legFL.current) legFL.current.rotation.x = 0;
        if (legFR.current) legFR.current.rotation.x = 0;
    }

    else if (action === PetAction.ROLL) {
        group.current.position.x = currentPos.current.x;
        group.current.position.z = currentPos.current.z;
        group.current.rotation.z = time * 5;
        group.current.position.y = 0.5;
    }

    else if (action === PetAction.PAT) {
        group.current.position.x = currentPos.current.x;
        group.current.position.z = currentPos.current.z;
        // Happy wiggle
        group.current.rotation.y = currentRot.current + Math.sin(time * 15) * 0.1;
        head.current.rotation.z = Math.sin(time * 10) * 0.2;
        head.current.scale.setScalar(1.1 + Math.sin(time * 20) * 0.05); 
    }

    else if (action === PetAction.STRIKE) {
        group.current.position.x = currentPos.current.x + Math.sin(time * 50) * 0.1; 
        group.current.position.z = currentPos.current.z;
        group.current.scale.setScalar(0.9); 
        head.current.rotation.x = 0.5; 
    }

    // Smooth return to zero X/Z rotation if not rolling/sitting
    if (action !== PetAction.ROLL) {
        group.current.rotation.z = MathUtils.lerp(group.current.rotation.z, 0, 0.1);
    }
    if (action !== PetAction.SIT && action !== PetAction.STRIKE && action !== PetAction.CALL) {
        // CALL uses rotation.x locally for head in the 'arrived' state, but we'll let that override
        // Actually we want body rotation.x to reset
        group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, 0, 0.1);
    }
  });

  return (
    <group ref={group} dispose={null}>
      {/* HEAD */}
      <group ref={head} position={[0, 1.2, 0.4]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.9, 0.8, 0.8]} />
          <meshStandardMaterial color={CAT_WHITE} />
        </mesh>
        {/* EARS */}
        <mesh position={[-0.3, 0.5, 0]}>
          <coneGeometry args={[0.15, 0.4, 4]} />
          <meshStandardMaterial color={CAT_PINK} />
        </mesh>
        <mesh position={[0.3, 0.5, 0]}>
          <coneGeometry args={[0.15, 0.4, 4]} />
          <meshStandardMaterial color={CAT_PINK} />
        </mesh>
        {/* EYES */}
        <mesh position={[-0.2, 0.1, 0.41]}>
          <boxGeometry args={[0.1, 0.2, 0.05]} />
          <meshStandardMaterial color={CAT_DARK} />
        </mesh>
        <mesh position={[0.2, 0.1, 0.41]}>
          <boxGeometry args={[0.1, 0.2, 0.05]} />
          <meshStandardMaterial color={CAT_DARK} />
        </mesh>
      </group>

      {/* BODY */}
      <mesh ref={body} position={[0, 0.3, 0]} scale={[1, 1, 1.5]}>
        <boxGeometry args={[0.8, 0.8, 1]} />
        <meshStandardMaterial color={CAT_PINK} />
      </mesh>

      {/* LEGS */}
      <group position={[0, 0, 0]}>
         {/* Front Left */}
        <mesh ref={legFL} position={[-0.3, -0.4, 0.6]}>
           <boxGeometry args={[0.2, 0.8, 0.2]} />
           <meshStandardMaterial color={CAT_WHITE} />
        </mesh>
        {/* Front Right */}
        <mesh ref={legFR} position={[0.3, -0.4, 0.6]}>
           <boxGeometry args={[0.2, 0.8, 0.2]} />
           <meshStandardMaterial color={CAT_WHITE} />
        </mesh>
        {/* Back Left */}
        <mesh ref={legBL} position={[-0.3, -0.4, -0.6]}>
           <boxGeometry args={[0.2, 0.8, 0.2]} />
           <meshStandardMaterial color={CAT_WHITE} />
        </mesh>
         {/* Back Right */}
         <mesh ref={legBR} position={[0.3, -0.4, -0.6]}>
           <boxGeometry args={[0.2, 0.8, 0.2]} />
           <meshStandardMaterial color={CAT_WHITE} />
        </mesh>
      </group>

      {/* TAIL */}
      <group position={[0, 0.5, -0.8]}>
        <mesh ref={tail} position={[0, 0.3, 0]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.15, 0.8, 0.15]} />
            <meshStandardMaterial color={CAT_WHITE} />
        </mesh>
      </group>
    </group>
  );
};
