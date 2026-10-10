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
  { name: 'Dugbe Commercial Hub', center: [0, 0], radius: 60, description: 'The bustling commercial & trading center of Ibadan.', landmarks: ['Dugbe Market Center', 'Mama Bukka Canteen', 'Commercial Plaza'] },
  { name: 'Iwo Road Transport Hub', center: [220, 0], radius: 55, description: 'Major interstate motor park and vibrant market.', landmarks: ['Iwo Road Motor Park', 'Gateway Mall'] },
  { name: 'Bodija Market & Estate', center: [120, 120], radius: 60, description: 'Upscale residential GRA and international produce market.', landmarks: ['Bodija Market Stalls', 'Bodija Housing Estate'] },
  { name: 'Oke-Ado Schools Corridor', center: [-150, -100], radius: 50, description: 'Historic educational and craft artisan quarter.', landmarks: ['Oke-Ado High School', 'Artisan Workshop Depot'] },
  { name: 'Jericho Residential Zone', center: [-220, 100], radius: 55, description: 'Lush, exclusive high-brow residential neighborhood.', landmarks: ['Jericho GRA Estates', 'Parks & Recreation'] }
];

export class IbadanWorld {
  public scene: THREE.Scene;
  public colliders: WorldCollider[] = [];
  public streetlights: THREE.SpotLight[] = [];
  public streetlightBulbs: THREE.Mesh[] = [];

  private sunLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;
  private hemiLight!: THREE.HemisphereLight;

  private currentLagosHour: number = 12;
  private timeFactor: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initLighting();
    this.buildTerrainAndRoadNetwork();
    this.buildDugbeStreetDetails();
    this.buildBodijaMarketDetails();
    this.buildEnterableShopInterior();
    this.loadKenneyBuildingModels();
    this.loadKenneyVehicleProps();
    this.updateLagosTime();
  }

  private initLighting() {
    this.ambientLight = new THREE.AmbientLight(0xfffbeb, 0.85);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x166534, 0.6);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffedd5, 1.3);
    this.sunLight.position.set(120, 150, 80);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 400;
    const d = 200;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.scene.add(this.sunLight);

    this.scene.fog = new THREE.FogExp2(0x38bdf8, 0.003);
  }

  private buildTerrainAndRoadNetwork() {
    // 1. Huge Ground Plane (800m x 800m)
    const groundGeo = new THREE.PlaneGeometry(800, 800);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Nigerian green
      roughness: 0.9,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8, metalness: 0.1 });
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
    const gutterMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });

    // 2. Main Dugbe - Iwo Road Highway (X-axis: x = -350 to +350, z = 0, width = 14m)
    const mainHwy = new THREE.Mesh(new THREE.PlaneGeometry(700, 14), roadMat);
    mainHwy.rotation.x = -Math.PI / 2;
    mainHwy.position.set(0, 0.01, 0);
    mainHwy.receiveShadow = true;
    this.scene.add(mainHwy);

    // Highway yellow dividers
    for (let x = -340; x <= 340; x += 14) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(7, 0.4), new THREE.MeshBasicMaterial({ color: 0xeab308 }));
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(x, 0.02, 0);
      this.scene.add(dash);
    }

    // Concrete gutters along main highway
    const gutter1 = new THREE.Mesh(new THREE.BoxGeometry(700, 0.4, 1.2), gutterMat);
    gutter1.position.set(0, -0.15, 7.6);
    this.scene.add(gutter1);

    const gutter2 = new THREE.Mesh(new THREE.BoxGeometry(700, 0.4, 1.2), gutterMat);
    gutter2.position.set(0, -0.15, -7.6);
    this.scene.add(gutter2);

    // Concrete Sidewalks along main highway
    const swNorth = new THREE.Mesh(new THREE.PlaneGeometry(700, 4), sidewalkMat);
    swNorth.rotation.x = -Math.PI / 2;
    swNorth.position.set(0, 0.03, 10.2);
    swNorth.receiveShadow = true;
    this.scene.add(swNorth);

    const swSouth = new THREE.Mesh(new THREE.PlaneGeometry(700, 4), sidewalkMat);
    swSouth.rotation.x = -Math.PI / 2;
    swSouth.position.set(0, 0.03, -10.2);
    swSouth.receiveShadow = true;
    this.scene.add(swSouth);

    // 3. Connecting District Avenue Roads
    // Bodija Avenue (Z-axis: x = 120, z = -100 to +250, width = 12m)
    const bodijaAvenue = new THREE.Mesh(new THREE.PlaneGeometry(12, 350), roadMat);
    bodijaAvenue.rotation.x = -Math.PI / 2;
    bodijaAvenue.position.set(120, 0.01, 75);
    bodijaAvenue.receiveShadow = true;
    this.scene.add(bodijaAvenue);

    // Oke-Ado Avenue (Z-axis: x = -150, z = -250 to +100, width = 12m)
    const okeAdoAvenue = new THREE.Mesh(new THREE.PlaneGeometry(12, 350), roadMat);
    okeAdoAvenue.rotation.x = -Math.PI / 2;
    okeAdoAvenue.position.set(-150, 0.01, -75);
    okeAdoAvenue.receiveShadow = true;
    this.scene.add(okeAdoAvenue);

    // Jericho Road (X-axis: z = 100, x = -300 to +50)
    const jerichoRoad = new THREE.Mesh(new THREE.PlaneGeometry(350, 10), roadMat);
    jerichoRoad.rotation.x = -Math.PI / 2;
    jerichoRoad.position.set(-125, 0.01, 100);
    jerichoRoad.receiveShadow = true;
    this.scene.add(jerichoRoad);
  }

  private buildDugbeStreetDetails() {
    // Streetlights along Dugbe Avenue
    for (let x = -280; x <= 280; x += 35) {
      if (Math.abs(x - 120) < 12 || Math.abs(x + 150) < 12) continue; // skip road intersections

      this.createStreetlight(x, 11.5);
      this.createStreetlight(x, -11.5);
    }

    // Kiosks and roadside shops along Dugbe
    this.createRoadsideKiosk(-35, 11.5, 'OGUNPA PROVISIONS STORE', 0xf59e0b);
    this.createRoadsideKiosk(25, -11.5, 'BODIJA RECHARGE & DATA', 0x3b82f6);
    this.createRoadsideKiosk(65, 11.5, 'ELECTRONICS REPAIR HUB', 0x10b981);

    // Compound perimeter walls with gates
    this.createCompoundWall(-80, 24, 45, 22);
    this.createCompoundWall(80, -24, 45, 22);
  }

  private buildBodijaMarketDetails() {
    // Market stalls in Bodija Market area
    const marketX = 120;
    const marketZ = 120;

    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (i === 0 && j === 0) continue;
        this.createMarketStall(marketX + i * 8, marketZ + j * 8);
      }
    }
  }

  private createMarketStall(x: number, z: number) {
    const stallGroup = new THREE.Group();
    stallGroup.position.set(x, 0, z);

    // Table / Stand
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 1.4), tableMat);
    table.position.y = 0.45;
    table.castShadow = true;
    stallGroup.add(table);

    // Umbrella Canopy
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4), poleMat);
    pole.position.set(0, 1.2, 0);
    stallGroup.add(pole);

    const canopyMat = new THREE.MeshStandardMaterial({ color: Math.random() > 0.5 ? 0xd97706 : 0x2563eb, roughness: 0.4 });
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.6, 8), canopyMat);
    canopy.position.set(0, 2.4, 0);
    stallGroup.add(canopy);

    this.scene.add(stallGroup);

    const box = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x, 0.8, z), new THREE.Vector3(2.4, 1.8, 1.6));
    this.colliders.push({ type: 'box', box });
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

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(3, 2.4, 2.5), bodyMat);
    body.position.y = 1.2;
    body.castShadow = true;
    kioskGroup.add(body);

    const roofMat = new THREE.MeshStandardMaterial({ color: bannerColorHex, roughness: 0.5 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.2, 2.9), roofMat);
    roof.position.y = 2.5;
    kioskGroup.add(roof);

    this.scene.add(kioskGroup);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 1.2, z), new THREE.Vector3(3.2, 2.5, 2.7));
    this.colliders.push({ type: 'box', box });
  }

  private createCompoundWall(centerX: number, centerZ: number, width: number, depth: number) {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.9 });
    const wallGroup = new THREE.Group();

    const h = 2.4;
    const t = 0.3;

    const wN = new THREE.Mesh(new THREE.BoxGeometry(width, h, t), wallMat);
    wN.position.set(centerX, h / 2, centerZ - depth / 2);
    wallGroup.add(wN);

    const wS1 = new THREE.Mesh(new THREE.BoxGeometry(width * 0.4, h, t), wallMat);
    wS1.position.set(centerX - width * 0.3, h / 2, centerZ + depth / 2);
    wallGroup.add(wS1);

    const wS2 = new THREE.Mesh(new THREE.BoxGeometry(width * 0.4, h, t), wallMat);
    wS2.position.set(centerX + width * 0.3, h / 2, centerZ + depth / 2);
    wallGroup.add(wS2);

    const wE = new THREE.Mesh(new THREE.BoxGeometry(t, h, depth), wallMat);
    wE.position.set(centerX + width / 2, h / 2, centerZ);
    wallGroup.add(wE);

    const wW = new THREE.Mesh(new THREE.BoxGeometry(t, h, depth), wallMat);
    wW.position.set(centerX - width / 2, h / 2, centerZ);
    wallGroup.add(wW);

    this.scene.add(wallGroup);

    const boxN = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(centerX, h / 2, centerZ - depth / 2), new THREE.Vector3(width, h, t));
    const boxS1 = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(centerX - width * 0.3, h / 2, centerZ + depth / 2), new THREE.Vector3(width * 0.4, h, t));
    const boxS2 = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(centerX + width * 0.3, h / 2, centerZ + depth / 2), new THREE.Vector3(width * 0.4, h, t));
    const boxE = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(centerX + width / 2, h / 2, centerZ), new THREE.Vector3(t, h, depth));
    const boxW = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(centerX - width / 2, h / 2, centerZ), new THREE.Vector3(t, h, depth));

    this.colliders.push({ type: 'box', box: boxN }, { type: 'box', box: boxS1 }, { type: 'box', box: boxS2 }, { type: 'box', box: boxE }, { type: 'box', box: boxW });
  }

  private buildEnterableShopInterior() {
    const shopX = -15;
    const shopZ = 15;
    const width = 8;
    const depth = 7;
    const height = 3.5;

    const shopMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.8 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.7 });

    const shopGroup = new THREE.Group();
    shopGroup.position.set(shopX, 0, shopZ);

    const t = 0.25;
    const doorWidth = 2.2;

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, height, t), shopMat);
    backWall.position.set(0, height / 2, -depth / 2);
    shopGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(t, height, depth), shopMat);
    leftWall.position.set(-width / 2, height / 2, 0);
    shopGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(t, height, depth), shopMat);
    rightWall.position.set(width / 2, height / 2, 0);
    shopGroup.add(rightWall);

    const frontSegWidth = (width - doorWidth) / 2;
    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(frontSegWidth, height, t), shopMat);
    frontWallLeft.position.set(-width / 2 + frontSegWidth / 2, height / 2, depth / 2);
    shopGroup.add(frontWallLeft);

    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(frontSegWidth, height, t), shopMat);
    frontWallRight.position.set(width / 2 - frontSegWidth / 2, height / 2, depth / 2);
    shopGroup.add(frontWallRight);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 0.6, 0.3, depth + 0.6), roofMat);
    roof.position.set(0, height + 0.15, 0);
    shopGroup.add(roof);

    const signMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.8, 0.15), signMat);
    sign.position.set(0, height - 0.4, depth / 2 + 0.1);
    shopGroup.add(sign);

    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(width - 0.2, depth - 0.2), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.02, 0);
    shopGroup.add(floor);

    const interiorLight = new THREE.PointLight(0xffedd5, 1.5, 12);
    interiorLight.position.set(0, height - 0.5, 0);
    shopGroup.add(interiorLight);

    this.scene.add(shopGroup);

    const boxB = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(shopX, height / 2, shopZ - depth / 2), new THREE.Vector3(width, height, t));
    const boxL = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(shopX - width / 2, height / 2, shopZ), new THREE.Vector3(t, height, depth));
    const boxR = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(shopX + width / 2, height / 2, shopZ), new THREE.Vector3(t, height, depth));
    const boxFL = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(shopX - width / 2 + frontSegWidth / 2, height / 2, shopZ + depth / 2), new THREE.Vector3(frontSegWidth, height, t));
    const boxFR = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(shopX + width / 2 - frontSegWidth / 2, height / 2, shopZ + depth / 2), new THREE.Vector3(frontSegWidth, height, t));

    this.colliders.push({ type: 'box', box: boxB }, { type: 'box', box: boxL }, { type: 'box', box: boxR }, { type: 'box', box: boxFL }, { type: 'box', box: boxFR });

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
      'building-type-j.glb', 'building-type-k.glb', 'building-type-l.glb',
      'building-type-m.glb', 'building-type-n.glb', 'building-type-o.glb'
    ];

    const placements = [
      { x: -20, z: 18, rot: 0, modelIdx: 0, scale: 3.8 },
      { x: 0, z: 18, rot: 0, modelIdx: 1, scale: 3.8 },
      { x: 20, z: 18, rot: 0, modelIdx: 2, scale: 3.8 },
      { x: -60, z: 18, rot: 0, modelIdx: 3, scale: 3.8 },
      { x: 60, z: 18, rot: 0, modelIdx: 4, scale: 3.8 },
      { x: 100, z: 18, rot: 0, modelIdx: 5, scale: 3.8 },
      { x: 180, z: 18, rot: 0, modelIdx: 6, scale: 3.8 },

      { x: -20, z: -18, rot: Math.PI, modelIdx: 7, scale: 3.8 },
      { x: 0, z: -18, rot: Math.PI, modelIdx: 8, scale: 3.8 },
      { x: 20, z: -18, rot: Math.PI, modelIdx: 9, scale: 3.8 },
      { x: -60, z: -18, rot: Math.PI, modelIdx: 10, scale: 3.8 },
      { x: 60, z: -18, rot: Math.PI, modelIdx: 11, scale: 3.8 },
      { x: 100, z: -18, rot: Math.PI, modelIdx: 12, scale: 3.8 },
      { x: 180, z: -18, rot: Math.PI, modelIdx: 13, scale: 3.8 },

      // Bodija & Jericho buildings
      { x: 145, z: 90, rot: Math.PI / 2, modelIdx: 12, scale: 3.8 },
      { x: 145, z: 140, rot: Math.PI / 2, modelIdx: 13, scale: 3.8 },
      { x: -200, z: 80, rot: -Math.PI / 2, modelIdx: 14, scale: 3.8 },
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
      { name: 'hatchback-sports.glb', x: 50, z: -4.5, rot: 0 },
      { name: 'garbage-truck.glb', x: 200, z: 4.5, rot: Math.PI },
    ];

    vehicles.forEach((v) => {
      gltfLoader.load(
        `${carPath}${v.name}`,
        (gltf) => {
          const car = gltf.scene;
          car.position.set(v.x, 0.05, v.z);
          car.rotation.y = v.rot;
          car.scale.set(2.0, 2.0, 2.0);

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
    const angle = factor * Math.PI * 2 - Math.PI / 2;

    const sunDistance = 200;
    this.sunLight.position.x = Math.cos(angle) * sunDistance;
    this.sunLight.position.y = Math.sin(angle) * sunDistance;
    this.sunLight.position.z = 80;

    const isNight = factor < 0.22 || factor > 0.78;

    if (isNight) {
      this.scene.background = new THREE.Color(0x0a0f1d);
      this.ambientLight.color.setHex(0x475569);
      this.ambientLight.intensity = 0.65;
      this.hemiLight.intensity = 0.45;
      this.sunLight.intensity = 0.2;
      this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.008);

      this.streetlights.forEach((s) => (s.intensity = 20));
      this.streetlightBulbs.forEach((b) => {
        (b.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.0;
      });
    } else if (factor >= 0.22 && factor < 0.3) {
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
      this.scene.background = new THREE.Color(0x38bdf8);
      this.ambientLight.color.setHex(0xfffbeb);
      this.ambientLight.intensity = 0.85;
      this.hemiLight.intensity = 0.6;
      this.sunLight.intensity = 1.3;
      this.scene.fog = new THREE.FogExp2(0x38bdf8, 0.003);

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
