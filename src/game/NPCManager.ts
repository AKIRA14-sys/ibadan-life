import * as THREE from 'three';
import { AnimatedCharacterController } from './AnimatedCharacter';

export interface NPCData {
  id: string;
  name: string;
  role: string;
  position: [number, number, number];
  rotation: number;
  dialogue?: string[];
}

export class NPCManager {
  public scene: THREE.Scene;
  public npcs: Map<string, { controller: AnimatedCharacterController; data: NPCData; waypointIdx: number }> = new Map();

  private waypoints: THREE.Vector3[] = [
    new THREE.Vector3(-40, 0, 10),
    new THREE.Vector3(0, 0, 10),
    new THREE.Vector3(40, 0, 10),
    new THREE.Vector3(40, 0, -10),
    new THREE.Vector3(0, 0, -10),
    new THREE.Vector3(-40, 0, -10),
  ];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public async spawnPresetNPCs() {
    const npcList: NPCData[] = [
      { id: 'npc_mama_bukka', name: 'Mama Shade', role: 'Bukka Canteen Owner', position: [-15, 0, 13.5], rotation: Math.PI, dialogue: ['Welcome to Mama Bukka Canteen!', 'Hot Amala & Ewedu ready!'] },
      { id: 'npc_trader_1', name: 'Ibrahim', role: 'Provisions Trader', position: [-35, 0, 9.5], rotation: Math.PI / 2, dialogue: ['Cold minerals and sachet water available!'] },
      { id: 'npc_pedestrian_1', name: 'Kemi', role: 'Pedestrian', position: [-20, 0, 10], rotation: 0, dialogue: ['Dugbe market is lively today.'] },
      { id: 'npc_pedestrian_2', name: 'Tunde', role: 'Pedestrian', position: [30, 0, -10], rotation: Math.PI, dialogue: ['Heading towards Iwo Road motor park.'] }
    ];

    for (const data of npcList) {
      const controller = new AnimatedCharacterController();
      await controller.loadCharacter({
        age: 28,
        gender: 'Female',
        skin_tone: '#734022',
        hairstyle: 'Short',
        hair_color: '#111827',
        face_style: 'Default',
        clothing: { top: '#059669', bottom: '#1e293b', shoes: '#000000' },
        personality: 'Friendly',
        starting_neighborhood: 'Dugbe'
      }, false);

      controller.group.position.set(...data.position);
      controller.group.rotation.y = data.rotation;
      this.scene.add(controller.group);

      this.npcs.set(data.id, { controller, data, waypointIdx: 0 });
    }
  }

  public update(delta: number, playerPos?: THREE.Vector3) {
    // Update walking pedestrians along waypoints
    this.npcs.forEach((item, id) => {
      const { controller } = item;

      // Mobile Optimization: Distance-based update throttling
      if (playerPos) {
        const dist = playerPos.distanceTo(controller.group.position);
        if (dist > 160) {
          return; // Skip distant NPC updates
        }
      }

      if (id.includes('pedestrian')) {
        const targetWP = this.waypoints[item.waypointIdx];
        const pos = controller.group.position;
        const dir = new THREE.Vector3().subVectors(targetWP, pos);
        dir.y = 0;

        if (dir.length() < 1.0) {
          item.waypointIdx = (item.waypointIdx + 1) % this.waypoints.length;
        } else {
          dir.normalize();
          const speed = 1.8 * delta;
          pos.addScaledVector(dir, speed);

          const rotY = Math.atan2(dir.x, dir.z);
          controller.setTargetRotation(rotY);
          controller.update(delta, true, false, false);
          return;
        }
      }

      controller.update(delta, false, false, false);
    });
  }

  public getNearestNPC(playerPos: THREE.Vector3, maxDist: number = 3.0): { data: NPCData; dist: number } | null {
    let nearest: { data: NPCData; dist: number } | null = null;

    this.npcs.forEach((item) => {
      const dist = playerPos.distanceTo(item.controller.group.position);
      if (dist <= maxDist) {
        if (!nearest || dist < nearest.dist) {
          nearest = { data: item.data, dist };
        }
      }
    });

    return nearest;
  }
}
