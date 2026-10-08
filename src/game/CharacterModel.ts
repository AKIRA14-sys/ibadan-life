import * as THREE from 'three';
import { CharacterData } from '../types';

export class CharacterMeshBuilder {
  static createCharacterMesh(character: CharacterData, isLocalPlayer: boolean = false): THREE.Group {
    const group = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.skin_tone || '#8d5524'),
      roughness: 0.7
    });
    const topMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.clothing?.top || '#2563eb'),
      roughness: 0.5
    });
    const bottomMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.clothing?.bottom || '#1e293b'),
      roughness: 0.6
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.hair_color || '#1c1917'),
      roughness: 0.9
    });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });

    const torsoGeo = new THREE.BoxGeometry(0.24, 0.38, 0.16);
    const torsoMesh = new THREE.Mesh(torsoGeo, topMat);
    torsoMesh.position.y = 0.52;
    group.add(torsoMesh);

    const headGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.y = 0.8;
    group.add(headMesh);

    const hairGeo = new THREE.SphereGeometry(0.108, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.y = 0.81;
    group.add(hairMesh);

    const legGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.33, 8);
    const leftLeg = new THREE.Mesh(legGeo, bottomMat);
    leftLeg.position.set(-0.07, 0.18, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, bottomMat);
    rightLeg.position.set(0.07, 0.18, 0);
    group.add(rightLeg);

    const shoeGeo = new THREE.BoxGeometry(0.06, 0.05, 0.12);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.07, 0.025, 0.02);
    group.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.07, 0.025, 0.02);
    group.add(rightShoe);

    const armGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.32, 8);
    const leftArm = new THREE.Mesh(armGeo, topMat);
    leftArm.position.set(-0.16, 0.5, 0);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, topMat);
    rightArm.position.set(0.16, 0.5, 0);
    group.add(rightArm);

    group.scale.set(0.55, 0.55, 0.55);

    if (isLocalPlayer) {
      const ringGeo = new THREE.RingGeometry(0.25, 0.28, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.01;
      group.add(ringMesh);
    }

    return group;
  }
}
