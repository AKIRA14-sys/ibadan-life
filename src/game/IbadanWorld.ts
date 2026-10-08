import * as THREE from 'three';

export interface DistrictZone {
  name: string;
  center: [number, number];
  radius: number;
  description: string;
  landmarks: string[];
}

export const IBADAN_DISTRICTS: DistrictZone[] = [
  { name: 'Iwo Road', center: [0, 0], radius: 35, description: 'Bustling transport hub and commercial gateway.', landmarks: ['Motor Park', 'Commercial Plaza'] },
  { name: 'Challenge', center: [60, -20], radius: 30, description: 'Major interchange with bustling retail shops.', landmarks: ['Challenge Roundabout', 'Shopping Mall'] },
  { name: 'Oke-Ado', center: [-50, -40], radius: 30, description: 'Historic residential and educational district.', landmarks: ['Oke-Ado High School', 'Celestial High'] },
  { name: 'Oke-Bola', center: [-40, -80], radius: 28, description: 'Vibrant neighborhood with comprehensive schools.', landmarks: ['Oke-Bola Comprehensive School'] },
  { name: 'NTC Road', center: [20, -70], radius: 25, description: 'Industrial and craft production corridor.', landmarks: ['NTC Workshop Depot'] },
  { name: 'Ring Road', center: [80, 40], radius: 35, description: 'Modern commercial strip with restaurants and banks.', landmarks: ['Ring Road Plaza'] },
  { name: 'Dugbe', center: [-30, 20], radius: 35, description: 'The central business district of Ibadan.', landmarks: ['Dugbe Market Center', 'Commercial Tower'] },
  { name: 'Bodija', center: [30, 80], radius: 38, description: 'Upscale residential neighborhood and market.', landmarks: ['Bodija International Market', 'Housing Estate'] },
  { name: 'Mokola', center: [-20, 60], radius: 30, description: 'Cultural crossroads and transit terminal.', landmarks: ['Mokola Roundabout', 'Cultural Center'] },
  { name: 'Sango', center: [0, 110], radius: 32, description: 'Educational and vibrant market hub.', landmarks: ['Sango Market Stalls', 'Concord College'] },
  { name: 'Odo-Ona', center: [-90, 10], radius: 30, description: 'Quiet residential riverfront community.', landmarks: ['Richers Foundation College'] },
  { name: 'Apata', center: [-110, -50], radius: 35, description: 'Western commercial gateway and artisan quarter.', landmarks: ['Apata Market', 'IMG Academy'] },
  { name: 'Jericho', center: [-70, 70], radius: 30, description: 'Lush, exclusive high-brow residential zone.', landmarks: ['Jericho GRA Estates'] },
  { name: 'Mapo/Oja-Oba', center: [40, -40], radius: 35, description: 'Ancient heart of Ibadan and royal market.', landmarks: ['Mapo Hill Complex', 'Oja Oba Central Market'] }
];

export class IbadanWorld {
  public scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildGroundAndRoads();
    this.buildCityDistricts();
    this.buildLighting();
  }

  private buildLighting() {
    const ambientLight = new THREE.AmbientLight(0xfffbeb, 0.75);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.1);
    dirLight.position.set(50, 100, 50);
    this.scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x166534, 0.4);
    this.scene.add(hemiLight);
  }

  private buildGroundAndRoads() {
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.9
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    this.scene.add(ground);

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });

    const hRoad1 = new THREE.Mesh(new THREE.PlaneGeometry(400, 10), roadMat);
    hRoad1.rotation.x = -Math.PI / 2;
    this.scene.add(hRoad1);

    const hRoad2 = new THREE.Mesh(new THREE.PlaneGeometry(10, 400), roadMat);
    hRoad2.rotation.x = -Math.PI / 2;
    this.scene.add(hRoad2);
  }

  private buildCityDistricts() {
    const buildingGeo = new THREE.BoxGeometry(1, 1, 1);
    const roofGeo = new THREE.ConeGeometry(0.75, 0.5, 4);

    const roofMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.7 });
    const wallMat1 = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.8 });
    const wallMat2 = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
    const marketMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
    const schoolMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 });

    IBADAN_DISTRICTS.forEach((district) => {
      const [centerX, centerZ] = district.center;

      const plazaGeo = new THREE.CylinderGeometry(district.radius * 0.4, district.radius * 0.4, 0.1, 16);
      const plazaMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
      const plaza = new THREE.Mesh(plazaGeo, plazaMat);
      plaza.position.set(centerX, 0.01, centerZ);
      this.scene.add(plaza);

      const buildingCount = 18;
      for (let i = 0; i < buildingCount; i++) {
        const angle = (i / buildingCount) * Math.PI * 2 + Math.random() * 0.2;
        const dist = 6 + Math.random() * (district.radius - 8);

        const x = centerX + Math.cos(angle) * dist;
        const z = centerZ + Math.sin(angle) * dist;

        const width = 3 + Math.random() * 4;
        const depth = 3 + Math.random() * 4;
        const height = 3 + Math.random() * 6;

        let mat = Math.random() > 0.5 ? wallMat1 : wallMat2;
        if (district.name.includes('Market') || district.name.includes('Oja')) {
          mat = marketMat;
        } else if (district.name.includes('Oke-Ado') || district.name.includes('School')) {
          mat = schoolMat;
        }

        const bMesh = new THREE.Mesh(buildingGeo, mat);
        bMesh.scale.set(width, height, depth);
        bMesh.position.set(x, height / 2, z);
        this.scene.add(bMesh);

        const rMesh = new THREE.Mesh(roofGeo, roofMat);
        rMesh.scale.set(width * 0.8, 1.2, depth * 0.8);
        rMesh.position.set(x, height + 0.6, z);
        rMesh.rotation.y = Math.PI / 4;
        this.scene.add(rMesh);
      }
    });
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
    return 'Iwo Road Corridor';
  }
}
