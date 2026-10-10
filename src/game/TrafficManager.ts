import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface MovingVehicle {
  mesh: THREE.Group;
  speed: number;
  direction: 1 | -1;
  laneZ: number;
  minX: number;
  maxX: number;
  bbox: THREE.Box3;
}

export class TrafficManager {
  public scene: THREE.Scene;
  public vehicles: MovingVehicle[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public async spawnTraffic() {
    const gltfLoader = new GLTFLoader();
    const carPath = '/assets/kenney/cars/Models/GLB format/';

    const carModels = ['sedan.glb', 'police.glb', 'delivery.glb', 'hatchback-sports.glb', 'suv-luxury.glb'];

    const trafficConfigs = [
      { model: 'sedan.glb', startX: -180, laneZ: 3.5, dir: 1 as const, speed: 12 },
      { model: 'police.glb', startX: -80, laneZ: 3.5, dir: 1 as const, speed: 14 },
      { model: 'delivery.glb', startX: 180, laneZ: -3.5, dir: -1 as const, speed: 10 },
      { model: 'hatchback-sports.glb', startX: 80, laneZ: -3.5, dir: -1 as const, speed: 11 },
      { model: 'suv-luxury.glb', startX: -240, laneZ: 3.5, dir: 1 as const, speed: 13 },
    ];

    for (const cfg of trafficConfigs) {
      gltfLoader.load(
        `${carPath}${cfg.model}`,
        (gltf) => {
          const mesh = gltf.scene;
          mesh.position.set(cfg.startX, 0.05, cfg.laneZ);
          mesh.rotation.y = cfg.dir === 1 ? Math.PI / 2 : -Math.PI / 2;
          mesh.scale.set(2.0, 2.0, 2.0);

          mesh.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
            }
          });

          this.scene.add(mesh);

          const bbox = new THREE.Box3().setFromObject(mesh);
          this.vehicles.push({
            mesh,
            speed: cfg.speed,
            direction: cfg.dir,
            laneZ: cfg.laneZ,
            minX: -320,
            maxX: 320,
            bbox
          });
        },
        undefined,
        (err) => console.warn(`Failed to spawn traffic vehicle ${cfg.model}:`, err)
      );
    }
  }

  public update(delta: number, playerPos: THREE.Vector3): { collided: boolean } {
    let collided = false;

    for (const v of this.vehicles) {
      v.mesh.position.x += v.direction * v.speed * delta;

      // Wrap around road bounds
      if (v.direction === 1 && v.mesh.position.x > v.maxX) {
        v.mesh.position.x = v.minX;
      } else if (v.direction === -1 && v.mesh.position.x < v.minX) {
        v.mesh.position.x = v.maxX;
      }

      v.bbox.setFromObject(v.mesh);

      // Check collision with player
      const playerBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(playerPos.x, playerPos.y + 0.8, playerPos.z),
        new THREE.Vector3(0.8, 1.6, 0.8)
      );

      if (v.bbox.intersectsBox(playerBox)) {
        collided = true;
      }
    }

    return { collided };
  }

  public isVehicleApproaching(pos: THREE.Vector3, threshold: number = 25): boolean {
    for (const v of this.vehicles) {
      const dist = pos.distanceTo(v.mesh.position);
      if (dist < threshold) {
        return true;
      }
    }
    return false;
  }
}
