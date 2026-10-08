import * as THREE from 'three';

export class CameraManager {
  public camera: THREE.PerspectiveCamera;
  private target: THREE.Object3D | null = null;
  private yaw: number = 0;
  private pitch: number = 0.35;
  private distance: number = 7.5;
  private minDistance: number = 3.0;
  private maxDistance: number = 14.0;

  constructor(aspectRatio: number) {
    this.camera = new THREE.PerspectiveCamera(55, aspectRatio, 0.1, 500);
    this.camera.position.set(0, 5, 8);
  }

  public setTarget(target: THREE.Object3D) {
    this.target = target;
  }

  public rotateAzimuth(deltaX: number) {
    this.yaw -= deltaX * 0.005;
  }

  public rotatePolar(deltaY: number) {
    this.pitch = Math.max(0.08, Math.min(Math.PI / 2.3, this.pitch + deltaY * 0.005));
  }

  public zoom(delta: number) {
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance + delta));
  }

  public getYaw(): number {
    return this.yaw;
  }

  public updateAspect(aspectRatio: number) {
    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();
  }

  public update() {
    if (!this.target) return;

    const targetPos = this.target.position.clone();
    targetPos.y += 0.8;

    const horizontalDistance = this.distance * Math.cos(this.pitch);
    const verticalDistance = this.distance * Math.sin(this.pitch);

    const camX = targetPos.x + horizontalDistance * Math.sin(this.yaw);
    const camY = Math.max(0.5, targetPos.y + verticalDistance);
    const camZ = targetPos.z + horizontalDistance * Math.cos(this.yaw);

    this.camera.position.x += (camX - this.camera.position.x) * 0.15;
    this.camera.position.y += (camY - this.camera.position.y) * 0.15;
    this.camera.position.z += (camZ - this.camera.position.z) * 0.15;

    this.camera.lookAt(targetPos);
  }
}
