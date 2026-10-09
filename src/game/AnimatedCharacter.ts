import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { CharacterData } from '../types';

export type CharacterState = 'idle' | 'walk' | 'run' | 'jump';

export class AnimatedCharacterController {
  public group: THREE.Group;
  public mixer: THREE.AnimationMixer | null = null;
  public actions: Map<CharacterState, THREE.AnimationAction> = new Map();
  public currentState: CharacterState = 'idle';
  public isLoaded: boolean = false;

  private targetRotationY: number = 0;
  private currentRotationY: number = 0;

  constructor() {
    this.group = new THREE.Group();
  }

  public async loadCharacter(characterData?: CharacterData, isLocalPlayer: boolean = false): Promise<void> {
    const fbxLoader = new FBXLoader();
    const basePath = '/assets/characters/';

    try {
      // 1. Load base rigged model
      const baseFbx = await fbxLoader.loadAsync(`${basePath}X Bot.fbx`);
      this.group.add(baseFbx);

      // Adjust scale (50-60% scale ratio relative to city structures)
      baseFbx.scale.set(0.012, 0.012, 0.012);
      baseFbx.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          const mesh = child as THREE.Mesh;
          if (characterData && mesh.material) {
            // Apply customized clothing & skin tone to model materials
            const skinColor = new THREE.Color(characterData.skin_tone || '#8d5524');
            const topColor = new THREE.Color(characterData.clothing?.top || '#2563eb');
            const bottomColor = new THREE.Color(characterData.clothing?.bottom || '#1e293b');

            if (mesh.name.toLowerCase().includes('body') || mesh.name.toLowerCase().includes('surface')) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: skinColor,
                roughness: 0.7,
                metalness: 0.1
              });
            } else if (mesh.name.toLowerCase().includes('joint') || mesh.name.toLowerCase().includes('alpha')) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: topColor,
                roughness: 0.5,
                metalness: 0.2
              });
            } else {
              mesh.material = new THREE.MeshStandardMaterial({
                color: bottomColor,
                roughness: 0.6
              });
            }
          }
        }
      });

      // 2. Initialize AnimationMixer on the base model
      this.mixer = new THREE.AnimationMixer(baseFbx);

      // 3. Load animation clips
      const animFiles: { state: CharacterState; file: string }[] = [
        { state: 'idle', file: 'Idle.fbx' },
        { state: 'walk', file: 'Walking.fbx' },
        { state: 'run', file: 'Running.fbx' },
        { state: 'jump', file: 'Jumping.fbx' },
      ];

      for (const anim of animFiles) {
        try {
          const animFbx = await fbxLoader.loadAsync(`${basePath}${anim.file}`);
          if (animFbx.animations && animFbx.animations.length > 0) {
            const clip = animFbx.animations[0];
            clip.name = anim.state;
            const action = this.mixer.clipAction(clip);
            this.actions.set(anim.state, action);
          }
        } catch (e) {
          console.warn(`Failed to load animation ${anim.file}:`, e);
        }
      }

      // Start with idle action
      const idleAction = this.actions.get('idle');
      if (idleAction) {
        idleAction.play();
      }

      this.isLoaded = true;
    } catch (err) {
      console.error('Error loading Mixamo character FBX, falling back to procedural mesh:', err);
      this.buildProceduralFallback(characterData, isLocalPlayer);
    }

    // Add local player indicator ring
    if (isLocalPlayer) {
      const ringGeo = new THREE.RingGeometry(0.35, 0.4, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.02;
      this.group.add(ringMesh);
    }
  }

  private buildProceduralFallback(characterData?: CharacterData, isLocalPlayer: boolean = false) {
    const skinMat = new THREE.MeshStandardMaterial({ color: characterData?.skin_tone || '#8d5524', roughness: 0.7 });
    const topMat = new THREE.MeshStandardMaterial({ color: characterData?.clothing?.top || '#2563eb', roughness: 0.5 });
    const bottomMat = new THREE.MeshStandardMaterial({ color: characterData?.clothing?.bottom || '#1e293b', roughness: 0.6 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.2), topMat);
    torso.position.y = 0.65;
    this.group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), skinMat);
    head.position.y = 1.05;
    this.group.add(head);

    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.45), bottomMat);
    leftLeg.position.set(-0.08, 0.22, 0);
    this.group.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.45), bottomMat);
    rightLeg.position.set(0.08, 0.22, 0);
    this.group.add(rightLeg);

    this.group.scale.set(0.6, 0.6, 0.6);
  }

  public setState(newState: CharacterState) {
    if (this.currentState === newState) return;

    const currentAction = this.actions.get(this.currentState);
    const newAction = this.actions.get(newState);

    if (currentAction && newAction) {
      currentAction.fadeOut(0.2);
      newAction.reset().fadeIn(0.2).play();
    } else if (newAction) {
      newAction.reset().play();
    }

    this.currentState = newState;
  }

  public setTargetRotation(rotationY: number) {
    this.targetRotationY = rotationY;
  }

  public update(delta: number, isMoving: boolean, isSprinting: boolean, isJumping: boolean = false) {
    // 1. Determine target animation state
    let targetState: CharacterState = 'idle';
    if (isJumping) {
      targetState = 'jump';
    } else if (isMoving) {
      targetState = isSprinting ? 'run' : 'walk';
    }

    this.setState(targetState);

    // 2. Update AnimationMixer
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // 3. Smooth character orientation rotation toward target movement direction
    let diff = this.targetRotationY - this.currentRotationY;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    this.currentRotationY += diff * Math.min(1.0, delta * 12);
    this.group.rotation.y = this.currentRotationY;
  }
}
