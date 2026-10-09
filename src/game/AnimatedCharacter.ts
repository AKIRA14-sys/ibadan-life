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
  private clothingGroup: THREE.Group = new THREE.Group();

  constructor() {
    this.group = new THREE.Group();
    this.group.add(this.clothingGroup);
  }

  public async loadCharacter(characterData?: CharacterData, isLocalPlayer: boolean = false): Promise<void> {
    const fbxLoader = new FBXLoader();
    const basePath = '/assets/characters/';

    try {
      // 1. Load base rigged model
      const baseFbx = await fbxLoader.loadAsync(`${basePath}X Bot.fbx`);
      this.group.add(baseFbx);

      baseFbx.scale.set(0.012, 0.012, 0.012);

      const skinColor = new THREE.Color(characterData?.skin_tone || '#8d5524');
      const topColor = new THREE.Color(characterData?.clothing?.top || '#2563eb');
      const bottomColor = new THREE.Color(characterData?.clothing?.bottom || '#1e293b');

      baseFbx.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          const mesh = child as THREE.Mesh;
          if (mesh.name.toLowerCase().includes('body') || mesh.name.toLowerCase().includes('surface') || mesh.name.toLowerCase().includes('bot')) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: skinColor,
              roughness: 0.7,
              metalness: 0.1
            });
          } else {
            mesh.material = new THREE.MeshStandardMaterial({
              color: topColor,
              roughness: 0.5
            });
          }
        }
      });

      // 2. Build 3D Outfit Clothing Geometries (Shirt, Pants/Skirt, Collar/Gele)
      this.attachOutfitClothingMeshes(characterData, topColor, bottomColor);

      // 3. Initialize AnimationMixer
      this.mixer = new THREE.AnimationMixer(baseFbx);

      // 4. Load animation clips
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
            action.enabled = true;
            action.setLoop(THREE.LoopRepeat, Infinity);
            this.actions.set(anim.state, action);
          }
        } catch (e) {
          console.warn(`Failed to load animation ${anim.file}:`, e);
        }
      }

      // Start with idle action immediately
      const idleAction = this.actions.get('idle');
      if (idleAction) {
        idleAction.reset().setEffectiveWeight(1.0).play();
        this.mixer.update(0.01);
      }

      this.isLoaded = true;
    } catch (err) {
      console.error('Error loading Mixamo character FBX, falling back to procedural mesh:', err);
      this.buildProceduralFallback(characterData, isLocalPlayer);
    }

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

  private attachOutfitClothingMeshes(
    characterData: CharacterData | undefined,
    topColor: THREE.Color,
    bottomColor: THREE.Color
  ) {
    // Clear previous clothing group items
    while (this.clothingGroup.children.length > 0) {
      this.clothingGroup.remove(this.clothingGroup.children[0]);
    }

    const topMat = new THREE.MeshStandardMaterial({ color: topColor, roughness: 0.5 });
    const bottomMat = new THREE.MeshStandardMaterial({ color: bottomColor, roughness: 0.6 });

    const isFemale = characterData?.gender === 'Female';

    // 1. Shirt / Top Torso Wrap
    const shirtMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.48, 0.26), topMat);
    shirtMesh.position.set(0, 0.95, 0);
    this.clothingGroup.add(shirtMesh);

    // Collar detail
    const collarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.08, 12), topMat);
    collarMesh.position.set(0, 1.2, 0);
    this.clothingGroup.add(collarMesh);

    if (isFemale) {
      // Female Skirt / Peplum Wrapper
      const skirtMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 0.45, 16), bottomMat);
      skirtMesh.position.set(0, 0.55, 0);
      this.clothingGroup.add(skirtMesh);

      // Traditional Gele / Headwrap accent
      const geleMesh = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.05, 8, 16), topMat);
      geleMesh.rotation.x = Math.PI / 3;
      geleMesh.position.set(0, 1.32, 0);
      this.clothingGroup.add(geleMesh);
    } else {
      // Male Trousers / Shorts
      const leftLegPant = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.5, 12), bottomMat);
      leftLegPant.position.set(-0.1, 0.45, 0);
      this.clothingGroup.add(leftLegPant);

      const rightLegPant = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.5, 12), bottomMat);
      rightLegPant.position.set(0.1, 0.45, 0);
      this.clothingGroup.add(rightLegPant);

      // Traditional Cap / Fila accent
      const capMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.1, 12), bottomMat);
      capMesh.position.set(0, 1.34, 0);
      capMesh.rotation.z = -0.15;
      this.clothingGroup.add(capMesh);
    }
  }

  private buildProceduralFallback(characterData?: CharacterData, isLocalPlayer: boolean = false) {
    const skinMat = new THREE.MeshStandardMaterial({ color: characterData?.skin_tone || '#8d5524', roughness: 0.7 });
    const topMat = new THREE.MeshStandardMaterial({ color: characterData?.clothing?.top || '#2563eb', roughness: 0.5 });
    const bottomMat = new THREE.MeshStandardMaterial({ color: characterData?.clothing?.bottom || '#1e293b', roughness: 0.6 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.22), topMat);
    torso.position.y = 0.75;
    this.group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), skinMat);
    head.position.y = 1.15;
    this.group.add(head);

    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.5), bottomMat);
    leftLeg.position.set(-0.09, 0.25, 0);
    this.group.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.5), bottomMat);
    rightLeg.position.set(0.09, 0.25, 0);
    this.group.add(rightLeg);

    this.group.scale.set(0.65, 0.65, 0.65);
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
    let targetState: CharacterState = 'idle';
    if (isJumping) {
      targetState = 'jump';
    } else if (isMoving) {
      targetState = isSprinting ? 'run' : 'walk';
    }

    this.setState(targetState);

    if (this.mixer) {
      this.mixer.update(delta);
    }

    let diff = this.targetRotationY - this.currentRotationY;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    this.currentRotationY += diff * Math.min(1.0, delta * 12);
    this.group.rotation.y = this.currentRotationY;
  }
}
