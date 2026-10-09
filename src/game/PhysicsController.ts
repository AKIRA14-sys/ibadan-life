import * as THREE from 'three';
import { WorldCollider } from './IbadanWorld';

export class PhysicsController {
  private playerRadius: number = 0.35;
  private playerHeight: number = 1.6;
  public verticalVelocity: number = 0;
  public isGrounded: boolean = true;
  public isJumping: boolean = false;

  private gravity: number = -18.0;
  private jumpImpulse: number = 7.5;

  public applyJump() {
    if (this.isGrounded) {
      this.verticalVelocity = this.jumpImpulse;
      this.isGrounded = false;
      this.isJumping = true;
    }
  }

  public update(
    position: THREE.Vector3,
    desiredMove: THREE.Vector3,
    delta: number,
    colliders: WorldCollider[]
  ): THREE.Vector3 {
    // 1. Vertical Physics (Gravity & Jumping)
    this.verticalVelocity += this.gravity * delta;
    position.y += this.verticalVelocity * delta;

    if (position.y <= 0) {
      position.y = 0;
      this.verticalVelocity = 0;
      this.isGrounded = true;
      this.isJumping = false;
    }

    // If move magnitude is tiny, return early
    if (desiredMove.lengthSq() < 0.00001) {
      return position;
    }

    // 2. Horizontal Collision Detection & Sliding Response
    // Attempt movement in X direction first
    const nextPosX = position.clone();
    nextPosX.x += desiredMove.x;

    if (!this.checkCollision(nextPosX, colliders)) {
      position.x = nextPosX.x;
    }

    // Attempt movement in Z direction
    const nextPosZ = position.clone();
    nextPosZ.z += desiredMove.z;

    if (!this.checkCollision(nextPosZ, colliders)) {
      position.z = nextPosZ.z;
    }

    return position;
  }

  public checkCollision(pos: THREE.Vector3, colliders: WorldCollider[]): boolean {
    const playerBox = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(pos.x, pos.y + this.playerHeight / 2, pos.z),
      new THREE.Vector3(this.playerRadius * 2, this.playerHeight, this.playerRadius * 2)
    );

    for (const collider of colliders) {
      if (collider.isTrigger) continue;

      if (collider.type === 'box' && collider.box) {
        if (playerBox.intersectsBox(collider.box)) {
          return true;
        }
      } else if (collider.type === 'cylinder' && collider.center && collider.radius) {
        const dx = pos.x - collider.center.x;
        const dz = pos.z - collider.center.z;
        const minDist = this.playerRadius + collider.radius;
        if (dx * dx + dz * dz < minDist * minDist) {
          return true;
        }
      }
    }
    return false;
  }
}
