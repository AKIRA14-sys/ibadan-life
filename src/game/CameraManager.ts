import * as THREE from 'three';

export class CameraManager {
  public camera: THREE.PerspectiveCamera;
  private target: THREE.Object3D | null = null;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();

  private yaw: number = 0;
  private pitch: number = 0.35;
  private distance: number = 7.0;
  private minDistance: number = 2.5;
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

  public update(collidersObjects: THREE.Object3D[] = []) {
    if (!this.target) return;

    const targetPos = this.target.position.clone();
    targetPos.y += 0.9;

    const horizontalDistance = this.distance * Math.cos(this.pitch);
    const verticalDistance = this.distance * Math.sin(this.pitch);

    let desiredCamX = targetPos.x + horizontalDistance * Math.sin(this.yaw);
    let desiredCamY = Math.max(0.5, targetPos.y + verticalDistance);
    let desiredCamZ = targetPos.z + horizontalDistance * Math.cos(this.yaw);

    const desiredCamPos = new THREE.Vector3(desiredCamX, desiredCamY, desiredCamZ);

    // Camera raycast check to prevent clipping through buildings
    if (collidersObjects.length > 0) {
      const dir = new THREE.Vector3().subVectors(desiredCamPos, targetPos).normalize();
      this.raycaster.set(targetPos, dir);
      const intersects = this.raycaster.intersectObjects(collidersObjects, true);

      if (intersects.length > 0 && intersects[0].distance < this.distance) {
        const safeDist = Math.max(this.minDistance, intersects[0].distance - 0.4);
        desiredCamX = targetPos.x + safeDist * Math.cos(this.pitch) * Math.sin(this.yaw);
        desiredCamY = Math.max(0.5, targetPos.y + safeDist * Math.sin(this.pitch));
        desiredCamZ = targetPos.z + safeDist * Math.cos(this.pitch) * Math.cos(this.yaw);
      }
    }

    this.camera.position.x += (desiredCamX - this.camera.position.x) * 0.18;
    this.camera.position.y += (desiredCamY - this.camera.position.y) * 0.18;
    this.camera.position.z += (desiredCamZ - this.camera.position.z) * 0.18;

    this.camera.lookAt(targetPos);
  }
}
