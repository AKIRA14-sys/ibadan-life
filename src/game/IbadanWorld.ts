import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface WorldCollider {
  type: 'box' | 'cylinder';
  box?: THREE.Box3;
  center?: THREE.Vector3;
  radius?: number;
  height?: number;
  isTrigger?: boolean;
  onEnter?: () => void;
}

export interface DistrictZone {
  name: string;
  center: [number, number];
  radius: number;
  description: string;
  landmarks: string[];
}

export const IBADAN_DISTRICTS: DistrictZone[] = [
  { name: 'Dugbe Commercial Hub', center: [0, 0], radius: 45, description: 'The bustling central commercial & trading heart of Ibadan.', landmarks: ['Dugbe Market Center', 'Mama Bukka Canteen', 'Commercial Towers'] },
  { name: 'Iwo Road Interchange', center: [80, 0], radius: 35, description: 'Bustling transport hub and commercial gateway.', landmarks: ['Motor Park', 'Commercial Plaza'] },
  { name: 'Bodija Estate', center: [0, 80], radius: 38, description: 'Upscale residential neighborhood and market.', landmarks: ['Bodija International Market', 'Housing Estate'] },
  { name: 'Challenge Interchange', center: [-80, -20], radius: 30, description: 'Major interchange with bustling retail shops.', landmarks: ['Challenge Roundabout', 'Shopping Mall'] },
  { name: 'Mapo Hill', center: [50, -60], radius: 35, description: 'Ancient heart of Ibadan and historic royal palace.', landmarks: ['Mapo Hall Complex', 'Oja Oba Central Market'] }
];

export class IbadanWorld {
  public scene: THREE.Scene;
  public colliders: WorldCollider[] = [];
  public streetlights: THREE.SpotLight[] = [];
  public streetlightBulbs: THREE.Mesh[] = [];
  public windowMaterials: THREE.MeshStandardMaterial[] = [];

  private sunLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;
  private hemiLight!: THREE.HemisphereLight;

  private currentLagosHour: number = 12;
  private timeFactor: number = 0; // 0 to 1 representing 00:00 to 24:00

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initLighting();
    this.buildTerrainAndRoads();
    this.buildDugbeStreetDetails();
    this.buildEnterableShopInterior();
    this.loadKenneyBuildingModels();
    this.loadKenneyVehicleProps();
    this.updateLagosTime();
  }

  private initLighting() {
    this.ambientLight = new THREE.AmbientLight(0xfffbeb, 0.6);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x166534, 0.4);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffedd5, 1.2);
    this.sunLight.position.set(60, 100, 40);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 250;
    const d = 80;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.scene.add(this.sunLight);

    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.008);
  }

  private buildTerrainAndRoads() {
    // 1. Base grass ground plane
    const groundGeo = new THREE.PlaneGeometry(500, 500);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Nigerian green vegetation
      roughness: 0.9,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Main Dugbe Avenue Asphalt Road (Running Along X axis: x = -150 to +150, z = 0, width = 14m)
    const roadGeo = new THREE.PlaneGeometry(300, 14);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.1
    });
    const mainRoad = new THREE.Mesh(roadGeo, roadMat);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.01, 0);
    mainRoad.receiveShadow = true;
    this.scene.add(mainRoad);

    // Yellow center divider line markings
    for (let x = -140; x <= 140; x += 12) {
      const dashGeo = new THREE.PlaneGeometry(6, 0.4);
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(x, 0.02, 0);
      this.scene.add(dash);
    }

    // 3. Concrete Gutters / Drainage Channels (Sobole) along both edges of main road (z = 7m and z = -7m)
    const gutterGeo = new THREE.BoxGeometry(300, 0.4, 1.2);
    const gutterMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });

    const gutterNorth = new THREE.Mesh(gutterGeo, gutterMat);
    gutterNorth.position.set(0, -0.15, 7.6);
    this.scene.add(gutterNorth);

    const gutterSouth = new THREE.Mesh(gutterGeo, gutterMat);
    gutterSouth.position.set(0, -0.15, -7.6);
    this.scene.add(gutterSouth);

    // 4. Pedestrian Concrete Sidewalks (z = 8.2m to 12.2m & z = -8.2m to -12.2m)
    const sidewalkGeo = new THREE.PlaneGeometry(300, 4);
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });

    const sidewalkNorth = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    sidewalkNorth.rotation.x = -Math.PI / 2;
    sidewalkNorth.position.set(0, 0.03, 10.2);
    sidewalkNorth.receiveShadow = true;
    this.scene.add(sidewalkNorth);

    const sidewalkSouth = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    sidewalkSouth.rotation.x = -Math.PI / 2;
    sidewalkSouth.position.set(0, 0.03, -10.2);
    sidewalkSouth.receiveShadow = true;
    this.scene.add(sidewalkSouth);

    // 5. Cross roads intersecting Dugbe Avenue
    const crossRoadGeo = new THREE.PlaneGeometry(12, 160);
    const crossRoad1 = new THREE.Mesh(crossRoadGeo, roadMat);
    crossRoad1.rotation.x = -Math.PI / 2;
    crossRoad1.position.set(60, 0.01, 0);
    crossRoad1.receiveShadow = true;
    this.scene.add(crossRoad1);

    const crossRoad2 = new THREE.Mesh(crossRoadGeo, roadMat);
    crossRoad2.rotation.x = -Math.PI / 2;
    crossRoad2.position.set(-60, 0.01, 0);
    crossRoad2.receiveShadow = true;
    this.scene.add(crossRoad2);
  }

  private buildDugbeStreetDetails() {
    // 1. Streetlights along Dugbe Avenue
    for (let x = -120; x <= 120; x += 30) {
      if (Math.abs(x - 60) < 10 || Math.abs(x + 60) < 10) continue; // skip intersections

      this.createStreetlight(x, 11.5);
      this.createStreetlight(x, -11.5);
    }

    // 2. Signboards & Kiosks
    this.createRoadsideKiosk(-35, 11, 'OGUNPA PROVISIONS STORE', 0xf59e0b);
    this.createRoadsideKiosk(25, -11, 'BODIJA RECHARGE & DATA', 0x3b82f6);
    this.createRoadsideKiosk(45, 11, 'ELECTRONICS REPAIR HUB', 0x10b981);

    // 3. Compound perimeter walls with gates
    this.createCompoundWall(-90, 22, 40, 20);
    this.createCompoundWall(90, -22, 40, 20);
  }

  private createStreetlight(x: number, z: number) {
    const poleGroup = new THREE.Group();
    poleGroup.position.set(x, 0, z);

    const poleGeo = new THREE.CylinderGeometry(0.1, 0.12, 6, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 3;
    poleGroup.add(pole);

    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.5, 8);
    const arm = new THREE.Mesh(armGeo, poleMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(0.5, 5.8, 0);
    poleGroup.add(arm);

    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: 0xfde047,
      emissiveIntensity: 0
    });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), bulbMat);
    bulb.position.set(1.2, 5.7, 0);
    poleGroup.add(bulb);
    this.streetlightBulbs.push(bulb);

    const spot = new THREE.SpotLight(0xffedd5, 0, 20, Math.PI / 4, 0.5);
    spot.position.set(x + 1.2, 5.7, z);
    spot.target.position.set(x + 1.2, 0, z);
    this.scene.add(spot);
    this.scene.add(spot.target);
    this.streetlights.push(spot);

    this.scene.add(poleGroup);

    // Add collider for pole
    this.colliders.push({
      type: 'cylinder',
      center: new THREE.Vector3(x, 0, z),
      radius: 0.3,
      height: 6
    });
  }

  private createRoadsideKiosk(x: number, z: number, name: string, bannerColorHex: number) {
    const kioskGroup = new THREE.Group();
    kioskGroup.position.set(x, 0, z);

    // Kiosk body structure
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(3, 2.4, 2.5), bodyMat);
    body.position.y = 1.2;
    body.castShadow = true;
    kioskGroup.add(body);

    // Roof / Canopy
    const roofMat = new THREE.MeshStandardMaterial({ color: bannerColorHex, roughness: 0.5 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.2, 2.9), roofMat);
    roof.position.y = 2.5;
    kioskGroup.add(roof);

    this.scene.add(kioskGroup);

    // Bounding collider
    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 1.2, z), new THREE.Vector3(3.2, 2.5, 2.7));
    this.colliders.push({ type: 'box', box });
  }

  private createCompoundWall(centerX: number, centerZ: number, width: number, depth: number) {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.9 });
    const wallGroup = new THREE.Group();

    // Wall height
    const h = 2.2;
    const t = 0.3; // thickness

    // North wall
    const wN = new THREE.Mesh(new THREE.BoxGeometry(width, h, t), wallMat);
    wN.position.set(centerX, h / 2, centerZ - depth / 2);
    wallGroup.add(wN);

    // South wall (with gate opening)
    const wS1 = new THREE.Mesh(new THREE.BoxGeometry(width * 0.4, h, t), wallMat);
    wS1.position.set(centerX - width * 0.3, h / 2, centerZ + depth / 2);
    wallGroup.add(wS1);

    const wS2 = new THREE.Mesh(new THREE.BoxGeometry(width * 0.4, h, t), wallMat);
    wS2.position.set(centerX + width * 0.3, h / 2, centerZ + depth / 2);
    wallGroup.add(wS2);

    // East & West walls
    const wE = new THREE.Mesh(new THREE.BoxGeometry(t, h, depth), wallMat);
    wE.position.set(centerX + width / 2, h / 2, centerZ);
    wallGroup.add(wE);

    const wW = new THREE.Mesh(new THREE.BoxGeometry(t, h, depth), wallMat);
    wW.position.set(centerX - width / 2, h / 2, centerZ);
    wallGroup.add(wW);

    this.scene.add(wallGroup);

    // Add colliders for walls
    const boxN = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(centerX, h / 2, centerZ - depth / 2), new THREE.Vector3(width, h, t));
    const boxS1 = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(centerX - width * 0.3, h / 2, centerZ + depth / 2), new THREE.Vector3(width * 0.4, h, t));
    const boxS2 = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(centerX + width * 0.3, h / 2, centerZ + depth / 2), new THREE.Vector3(width * 0.4, h, t));
    const boxE = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(centerX + width / 2, h / 2, centerZ), new THREE.Vector3(t, h, depth));
    const boxW = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(centerX - width / 2, h / 2, centerZ), new THREE.Vector3(t, h, depth));

    this.colliders.push({ type: 'box', box: boxN }, { type: 'box', box: boxS1 }, { type: 'box', box: boxS2 }, { type: 'box', box: boxE }, { type: 'box', box: boxW });
  }

  private buildEnterableShopInterior() {
    // "MAMA BUKKA CANTEEN" at (x = -15, z = 14)
    const shopX = -15;
    const shopZ = 15;
    const width = 8;
    const depth = 7;
    const height = 3.2;

    const shopMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.8 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.7 });

    const shopGroup = new THREE.Group();
    shopGroup.position.set(shopX, 0, shopZ);

    // Walls with entrance doorway on front wall (south, towards street z = 11.5)
    const t = 0.25;
    const doorWidth = 2.2;

    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, height, t), shopMat);
    backWall.position.set(0, height / 2, -depth / 2);
    shopGroup.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(t, height, depth), shopMat);
    leftWall.position.set(-width / 2, height / 2, 0);
    shopGroup.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(t, height, depth), shopMat);
    rightWall.position.set(width / 2, height / 2, 0);
    shopGroup.add(rightWall);

    // Front wall (left segment & right segment leaving doorway in middle)
    const frontSegWidth = (width - doorWidth) / 2;
    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(frontSegWidth, height, t), shopMat);
    frontWallLeft.position.set(-width / 2 + frontSegWidth / 2, height / 2, depth / 2);
    shopGroup.add(frontWallLeft);

    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(frontSegWidth, height, t), shopMat);
    frontWallRight.position.set(width / 2 - frontSegWidth / 2, height / 2, depth / 2);
    shopGroup.add(frontWallRight);

    // Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 0.6, 0.3, depth + 0.6), roofMat);
    roof.position.set(0, height + 0.15, 0);
    shopGroup.add(roof);

    // Signboard banner
    const signMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.8, 0.15), signMat);
    sign.position.set(0, height - 0.4, depth / 2 + 0.1);
    shopGroup.add(sign);

    // Interior floor
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(width - 0.2, depth - 0.2), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.02, 0);
    shopGroup.add(floor);

    // Interior warm ceiling light
    const interiorLight = new THREE.PointLight(0xffedd5, 1.5, 10);
    interiorLight.position.set(0, height - 0.5, 0);
    shopGroup.add(interiorLight);

    this.scene.add(shopGroup);

    // Add wall colliders (leaving doorway open!)
    const boxB = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(shopX, height / 2, shopZ - depth / 2), new THREE.Vector3(width, height, t));
    const boxL = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(shopX - width / 2, height / 2, shopZ), new THREE.Vector3(t, height, depth));
    const boxR = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(shopX + width / 2, height / 2, shopZ), new THREE.Vector3(t, height, depth));
    const boxFL = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(shopX - width / 2 + frontSegWidth / 2, height / 2, shopZ + depth / 2), new THREE.Vector3(frontSegWidth, height, t));
    const boxFR = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(shopX + width / 2 - frontSegWidth / 2, height / 2, shopZ + depth / 2), new THREE.Vector3(frontSegWidth, height, t));

    this.colliders.push({ type: 'box', box: boxB }, { type: 'box', box: boxL }, { type: 'box', box: boxR }, { type: 'box', box: boxFL }, { type: 'box', box: boxFR });

    // Load furniture inside Mama Bukka Canteen
    const gltfLoader = new GLTFLoader();
    const furnPath = '/assets/kenney/furniture/Models/GLTF format/';

    gltfLoader.load(`${furnPath}tableRound.glb`, (gltf) => {
      const table = gltf.scene;
      table.position.set(shopX - 1.8, 0.02, shopZ - 1.2);
      table.scale.set(1.2, 1.2, 1.2);
      this.scene.add(table);
    });

    gltfLoader.load(`${furnPath}loungeSofa.glb`, (gltf) => {
      const sofa = gltf.scene;
      sofa.position.set(shopX + 1.8, 0.02, shopZ - 1.5);
      sofa.rotation.y = -Math.PI / 2;
      sofa.scale.set(1.2, 1.2, 1.2);
      this.scene.add(sofa);
    });

    gltfLoader.load(`${furnPath}kitchenBar.glb`, (gltf) => {
      const bar = gltf.scene;
      bar.position.set(shopX, 0.02, shopZ - 2.2);
      bar.scale.set(1.2, 1.2, 1.2);
      this.scene.add(bar);
    });
  }

  private loadKenneyBuildingModels() {
    const gltfLoader = new GLTFLoader();
    const cityPath = '/assets/kenney/city/Models/GLB format/';

    const buildingTypes = [
      'building-type-a.glb', 'building-type-b.glb', 'building-type-c.glb',
      'building-type-d.glb', 'building-type-e.glb', 'building-type-f.glb',
      'building-type-g.glb', 'building-type-h.glb', 'building-type-i.glb',
      'building-type-j.glb', 'building-type-k.glb', 'building-type-l.glb'
    ];

    // Place building models along Dugbe street and cross streets
    const placements = [
      { x: -50, z: 18, rot: 0, modelIdx: 0, scale: 3.5 },
      { x: -80, z: 18, rot: 0, modelIdx: 1, scale: 3.5 },
      { x: 15, z: 18, rot: 0, modelIdx: 2, scale: 3.5 },
      { x: 45, z: 18, rot: 0, modelIdx: 3, scale: 3.5 },
      { x: 85, z: 18, rot: 0, modelIdx: 4, scale: 3.5 },

      { x: -45, z: -18, rot: Math.PI, modelIdx: 5, scale: 3.5 },
      { x: -75, z: -18, rot: Math.PI, modelIdx: 6, scale: 3.5 },
      { x: 15, z: -18, rot: Math.PI, modelIdx: 7, scale: 3.5 },
      { x: 45, z: -18, rot: Math.PI, modelIdx: 8, scale: 3.5 },
      { x: 85, z: -18, rot: Math.PI, modelIdx: 9, scale: 3.5 },
    ];

    placements.forEach((p) => {
      const fileName = buildingTypes[p.modelIdx % buildingTypes.length];
      gltfLoader.load(
        `${cityPath}${fileName}`,
        (gltf) => {
          const model = gltf.scene;
          model.position.set(p.x, 0, p.z);
          model.rotation.y = p.rot;
          model.scale.set(p.scale, p.scale, p.scale);

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          this.scene.add(model);

          // Add bounding box collider
          const bbox = new THREE.Box3().setFromObject(model);
          this.colliders.push({ type: 'box', box: bbox });
        },
        undefined,
        (err) => console.warn(`Failed to load building ${fileName}:`, err)
      );
    });
  }

  private loadKenneyVehicleProps() {
    const gltfLoader = new GLTFLoader();
    const carPath = '/assets/kenney/cars/Models/GLB format/';

    const vehicles = [
      { name: 'sedan.glb', x: -10, z: -4.5, rot: 0 },
      { name: 'police.glb', x: 20, z: 4.5, rot: Math.PI },
      { name: 'delivery.glb', x: -40, z: -4.5, rot: 0 },
      { name: 'hatchback.glb', x: 50, z: -4.5, rot: 0 },
    ];

    vehicles.forEach((v) => {
      gltfLoader.load(
        `${carPath}${v.name}`,
        (gltf) => {
          const car = gltf.scene;
          car.position.set(v.x, 0.05, v.z);
          car.rotation.y = v.rot;
          car.scale.set(1.8, 1.8, 1.8);

          car.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
            }
          });

          this.scene.add(car);

          const bbox = new THREE.Box3().setFromObject(car);
          this.colliders.push({ type: 'box', box: bbox });
        },
        undefined,
        (err) => console.warn(`Failed to load car prop ${v.name}:`, err)
      );
    });
  }

  public updateLagosTime() {
    // Determine Africa/Lagos current time (UTC+1)
    const now = new Date();
    const lagosTimeString = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Lagos',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    }).format(now);

    const parts = lagosTimeString.split(':');
    const hour = parseInt(parts[0], 10) || 12;
    const min = parseInt(parts[1], 10) || 0;

    this.currentLagosHour = hour;
    this.timeFactor = (hour + min / 60) / 24;

    this.applyLightingForTime(this.timeFactor);
  }

  private applyLightingForTime(factor: number) {
    // 0.0 = midnight, 0.25 = 06:00 (dawn), 0.5 = 12:00 (noon), 0.75 = 18:00 (sunset)
    const angle = factor * Math.PI * 2 - Math.PI / 2;

    const sunDistance = 150;
    this.sunLight.position.x = Math.cos(angle) * sunDistance;
    this.sunLight.position.y = Math.sin(angle) * sunDistance;
    this.sunLight.position.z = 40;

    const isNight = factor < 0.22 || factor > 0.78;

    if (isNight) {
      // Nighttime
      this.scene.background = new THREE.Color(0x0a0f1d);
      this.ambientLight.color.setHex(0x1e293b);
      this.ambientLight.intensity = 0.35;
      this.hemiLight.intensity = 0.2;
      this.sunLight.intensity = 0.1;
      this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.012);

      // Turn on streetlights
      this.streetlights.forEach((s) => (s.intensity = 20));
      this.streetlightBulbs.forEach((b) => {
        (b.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.0;
      });
    } else if (factor >= 0.22 && factor < 0.3) {
      // Dawn / Sunrise
      this.scene.background = new THREE.Color(0xfba518);
      this.ambientLight.color.setHex(0xfeb2b2);
      this.ambientLight.intensity = 0.7;
      this.hemiLight.intensity = 0.5;
      this.sunLight.intensity = 0.9;
      this.scene.fog = new THREE.FogExp2(0x451a03, 0.008);

      this.streetlights.forEach((s) => (s.intensity = 5));
      this.streetlightBulbs.forEach((b) => {
        (b.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3;
      });
    } else if (factor >= 0.7 && factor <= 0.78) {
      // Sunset
      this.scene.background = new THREE.Color(0xc2410c);
      this.ambientLight.color.setHex(0xfdba74);
      this.ambientLight.intensity = 0.7;
      this.hemiLight.intensity = 0.5;
      this.sunLight.intensity = 0.8;
      this.scene.fog = new THREE.FogExp2(0x7c2d12, 0.008);

      this.streetlights.forEach((s) => (s.intensity = 10));
      this.streetlightBulbs.forEach((b) => {
        (b.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;
      });
    } else {
      // Daytime
      this.scene.background = new THREE.Color(0x38bdf8);
      this.ambientLight.color.setHex(0xfffbeb);
      this.ambientLight.intensity = 0.85;
      this.hemiLight.intensity = 0.6;
      this.sunLight.intensity = 1.3;
      this.scene.fog = new THREE.FogExp2(0x38bdf8, 0.004);

      this.streetlights.forEach((s) => (s.intensity = 0));
      this.streetlightBulbs.forEach((b) => {
        (b.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      });
    }
  }

  public getFormattedLagosTime(): string {
    const h = this.currentLagosHour.toString().padStart(2, '0');
    const isNight = this.currentLagosHour < 6 || this.currentLagosHour >= 19;
    return `${h}:00 WAT (${isNight ? 'Night' : 'Day'})`;
  }

  public getDistrictAtPosition(x: number, z: number): string {
    for (const district of IBADAN_DISTRICTS) {
      const [cx, cz] = district.center;
      const dx = x - cx;
      const dz = z - cz;
      if (dx * dx + dz * dz <= district.radius * district.radius) {
        return district.name;
      }
    }
    return 'Dugbe Commercial Hub';
  }
}
