import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getOrCreateGuestSession } from './services/guestAuth';
import { GameDataService } from './services/gameData';
import { RealtimeService } from './services/realtime';
import { IbadanWorld, IBADAN_DISTRICTS, DistrictZone } from './game/IbadanWorld';
import { CameraManager } from './game/CameraManager';
import { AnimatedCharacterController } from './game/AnimatedCharacter';
import { PhysicsController } from './game/PhysicsController';
import { NPCManager } from './game/NPCManager';
import { TrafficManager } from './game/TrafficManager';
import { CharacterMeshBuilder } from './game/CharacterModel';
import { CharacterCreator } from './components/CharacterCreator';
import { CharacterCustomizationModal } from './components/CharacterCustomizationModal';
import { MobileControls } from './components/MobileControls';
import { OrientationPrompt } from './components/OrientationPrompt';
import { InteractionMenu } from './components/InteractionMenu';
import { ChatOverlay } from './components/ChatOverlay';
import { WalletHUD } from './components/WalletHUD';
import { JobsModal } from './components/JobsModal';
import { MarketModal } from './components/MarketModal';
import { HousingModal } from './components/HousingModal';
import { BusinessModal } from './components/BusinessModal';
import { MapModal } from './components/MapModal';
import { TravelModal } from './components/TravelModal';
import { Player, CharacterData, HiddenBackground, Wallet, NetworkPlayer, ChatMessage, Job, Property } from './types';
import { Briefcase, ShoppingBag, Home, Building2, Shirt } from 'lucide-react';
import { OutfitOption } from './data/outfits';

export function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  const [playerData, setPlayerData] = useState<{
    player: Player;
    character: CharacterData;
    wallet: Wallet;
    background: HiddenBackground;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [remotePlayers, setRemotePlayers] = useState<NetworkPlayer[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentDistrict, setCurrentDistrict] = useState('Dugbe Commercial Hub');
  const [lagosTimeDisplay, setLagosTimeDisplay] = useState('12:00 WAT (Day)');

  const [activeModal, setActiveModal] = useState<'jobs' | 'market' | 'housing' | 'business' | 'map' | 'travel' | 'customization' | null>(null);
  const [selectedInteractionPlayer, setSelectedInteractionPlayer] = useState<NetworkPlayer | null>(null);
  const [nearestInteraction, setNearestInteraction] = useState<string | null>(null);

  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [userInventory, setUserInventory] = useState<any[]>([]);
  const [catalogJobs, setCatalogJobs] = useState<Job[]>([]);
  const [catalogProperties, setCatalogProperties] = useState<Property[]>([]);
  const [userBusinesses, setUserBusinesses] = useState<any[]>([]);

  const realtimeRef = useRef<RealtimeService | null>(null);
  const localPlayerControllerRef = useRef<AnimatedCharacterController | null>(null);
  const physicsRef = useRef<PhysicsController>(new PhysicsController());
  const npcManagerRef = useRef<NPCManager | null>(null);
  const trafficManagerRef = useRef<TrafficManager | null>(null);

  const remotePlayerMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const cameraManagerRef = useRef<CameraManager | null>(null);
  const worldRef = useRef<IbadanWorld | null>(null);

  const moveVectorRef = useRef({ x: 0, y: 0 });
  const isSprintingRef = useRef(false);
  const autoWalkTargetRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    async function initSession() {
      const guest = getOrCreateGuestSession();
      const existing = await GameDataService.loadFullPlayerData(guest.guest_id);

      if (existing) {
        setPlayerData({
          player: existing.player,
          character: existing.character,
          wallet: existing.wallet,
          background: existing.playerPrivate.hidden_background
        });
        setCurrentDistrict(existing.player.current_district || 'Dugbe Commercial Hub');
      }

      const [items, jobs, props] = await Promise.all([
        GameDataService.getCatalogItems(),
        GameDataService.getJobsCatalog(),
        GameDataService.getPropertiesCatalog()
      ]);
      setCatalogItems(items);
      setCatalogJobs(jobs);
      setCatalogProperties(props);

      setIsLoading(false);
    }

    initSession();
  }, []);

  const handleCharacterComplete = async (data: {
    displayName: string;
    character: CharacterData;
    background: HiddenBackground;
  }) => {
    setIsLoading(true);
    const guest = getOrCreateGuestSession();
    const created = await GameDataService.createNewPlayer(
      guest.guest_id,
      data.displayName,
      data.character,
      data.background
    );

    setPlayerData({
      player: created.player,
      character: created.character,
      wallet: created.wallet,
      background: data.background
    });
    setCurrentDistrict(created.character.starting_neighborhood || 'Dugbe Commercial Hub');
    setIsLoading(false);
  };

  useEffect(() => {
    if (!playerData || !mountRef.current) return;

    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x38bdf8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    mountRef.current.appendChild(renderer.domElement);

    const cameraMgr = new CameraManager(width / height);
    cameraManagerRef.current = cameraMgr;

    const world = new IbadanWorld(scene);
    worldRef.current = world;

    const npcMgr = new NPCManager(scene);
    npcManagerRef.current = npcMgr;
    npcMgr.spawnPresetNPCs();

    const trafficMgr = new TrafficManager(scene);
    trafficManagerRef.current = trafficMgr;
    trafficMgr.spawnTraffic();

    const localController = new AnimatedCharacterController();
    localPlayerControllerRef.current = localController;
    localController.loadCharacter(playerData.character, true).then(() => {
      cameraMgr.setTarget(localController.group);
    });
    scene.add(localController.group);

    const realtime = new RealtimeService(
      currentDistrict,
      {
        id: playerData.player.id,
        guest_id: playerData.player.guest_id,
        display_name: playerData.player.display_name,
        character: playerData.character,
        reputation: playerData.player.reputation,
        status: playerData.player.status
      },
      (players) => setRemotePlayers(players),
      (msg) => setChatMessages((prev) => [...prev.slice(-40), msg])
    );
    realtimeRef.current = realtime;

    let animationFrameId: number;
    let clock = new THREE.Clock();
    let timeAccumulator = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      timeAccumulator += delta;
      if (timeAccumulator > 10.0) {
        timeAccumulator = 0;
        world.updateLagosTime();
        setLagosTimeDisplay(world.getFormattedLagosTime());
      }

      if (localPlayerControllerRef.current && cameraManagerRef.current) {
        const localGroup = localPlayerControllerRef.current.group;
        let move = moveVectorRef.current;

        // Auto-Walk navigation override
        if (autoWalkTargetRef.current) {
          const dir = new THREE.Vector3().subVectors(autoWalkTargetRef.current, localGroup.position);
          dir.y = 0;
          if (dir.length() < 2.0) {
            autoWalkTargetRef.current = null;
          } else {
            dir.normalize();
            move = { x: dir.x, y: -dir.z };
          }
        }

        const isMoving = move.x !== 0 || move.y !== 0;

        if (isMoving) {
          const speedMultiplier = isSprintingRef.current ? 7.5 : 4.2;
          const yaw = cameraManagerRef.current.getYaw();

          const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
          const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();

          const moveDir = new THREE.Vector3()
            .addScaledVector(right, move.x)
            .addScaledVector(forward, -move.y)
            .normalize();

          const desiredVelocity = moveDir.multiplyScalar(speedMultiplier * delta);

          physicsRef.current.update(
            localGroup.position,
            desiredVelocity,
            delta,
            world.colliders
          );

          const moveAngle = Math.atan2(moveDir.x, moveDir.z);
          localPlayerControllerRef.current.setTargetRotation(moveAngle);

          realtimeRef.current?.sendTransform(
            [localGroup.position.x, localGroup.position.y, localGroup.position.z],
            localGroup.rotation.y
          );

          const district = world.getDistrictAtPosition(
            localGroup.position.x,
            localGroup.position.z
          );
          if (district !== currentDistrict) {
            setCurrentDistrict(district);
            realtimeRef.current?.changeDistrict(district);
          }
        } else {
          physicsRef.current.update(
            localGroup.position,
            new THREE.Vector3(),
            delta,
            world.colliders
          );
        }

        localPlayerControllerRef.current.update(
          delta,
          isMoving,
          isSprintingRef.current,
          physicsRef.current.isJumping
        );

        // NPC update with distance throttling
        npcMgr.update(delta, localGroup.position);

        // Traffic update and vehicle collision recovery check
        const trafficState = trafficMgr.update(delta, localGroup.position);
        if (trafficState.collided) {
          const safeZ = localGroup.position.z > 0 ? 10.5 : -10.5;
          const candidatePos = localGroup.position.clone();
          candidatePos.z = safeZ;
          if (!physicsRef.current.checkCollision(candidatePos, world.colliders)) {
            localGroup.position.z = safeZ;
          }
        }

        const npcMatch = npcMgr.getNearestNPC(localGroup.position, 3.5);
        if (npcMatch) {
          setNearestInteraction(`Talk to ${npcMatch.data.name} (${npcMatch.data.role})`);
        } else if (remotePlayers.length > 0) {
          setNearestInteraction(`Interact with ${remotePlayers[0].display_name}`);
        } else {
          setNearestInteraction(null);
        }
      }

      npcMgr.update(delta);

      remotePlayers.forEach((rp) => {
        let mesh = remotePlayerMeshesRef.current.get(rp.id);
        if (!mesh) {
          mesh = CharacterMeshBuilder.createCharacterMesh(rp.character, false);
          scene.add(mesh);
          remotePlayerMeshesRef.current.set(rp.id, mesh);
        }
        mesh.position.lerp(new THREE.Vector3(...rp.position), 0.2);
        mesh.rotation.y = rp.rotation;
      });

      remotePlayerMeshesRef.current.forEach((mesh, id) => {
        if (!remotePlayers.some((rp) => rp.id === id)) {
          scene.remove(mesh);
          remotePlayerMeshesRef.current.delete(id);
        }
      });

      cameraMgr.update();
      renderer.render(scene, cameraMgr.camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraMgr.updateAspect(w / h);
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      realtime.disconnect();
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [playerData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      autoWalkTargetRef.current = null; // Manual key cancels auto-walk
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') moveVectorRef.current.y = -1;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') moveVectorRef.current.y = 1;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') moveVectorRef.current.x = -1;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') moveVectorRef.current.x = 1;
      if (e.key === 'Shift') isSprintingRef.current = true;
      if (e.code === 'Space') physicsRef.current.applyJump();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['w', 'W', 's', 'S', 'ArrowUp', 'ArrowDown'].includes(e.key)) moveVectorRef.current.y = 0;
      if (['a', 'A', 'd', 'D', 'ArrowLeft', 'ArrowRight'].includes(e.key)) moveVectorRef.current.x = 0;
      if (e.key === 'Shift') isSprintingRef.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleSelectTravel = (destination: DistrictZone, mode: 'trek' | 'autowalk' | 'teleport') => {
    const [cx, cz] = destination.center;
    setActiveModal(null);

    if (mode === 'teleport') {
      if (localPlayerControllerRef.current) {
        localPlayerControllerRef.current.group.position.set(cx, 0.1, cz + 10.5);
      }
      setCurrentDistrict(destination.name);
    } else if (mode === 'autowalk') {
      autoWalkTargetRef.current = new THREE.Vector3(cx, 0, cz);
    } else if (mode === 'trek') {
      alert(`Waypoint set to ${destination.name}! Follow the direction indicator.`);
    }
  };

  const handleSelectOutfit = (outfit: OutfitOption, gender: 'Male' | 'Female') => {
    if (!playerData) return;
    const updatedChar = {
      ...playerData.character,
      gender,
      clothing: {
        ...playerData.character.clothing,
        top: outfit.topColor,
        bottom: outfit.bottomColor
      }
    };

    setPlayerData((prev) => prev ? { ...prev, character: updatedChar } : null);

    if (localPlayerControllerRef.current) {
      localPlayerControllerRef.current.loadCharacter(updatedChar, true);
    }
  };

  const handleWorkJob = async (job: Job) => {
    if (!playerData) return;
    const guest = getOrCreateGuestSession();
    const updatedWallet = await GameDataService.updateWalletBalance(
      playerData.player.id,
      guest.guest_id,
      job.salary,
      'Earned',
      { job_name: job.name }
    );
    if (updatedWallet) {
      setPlayerData((prev) => (prev ? { ...prev, wallet: updatedWallet } : null));
    }
  };

  const handleBuyItem = async (item: any) => {
    if (!playerData) return;
    if (playerData.wallet.cash < item.price) {
      alert('Insufficient cash in wallet!');
      return;
    }
    const guest = getOrCreateGuestSession();
    const updatedWallet = await GameDataService.updateWalletBalance(
      playerData.player.id,
      guest.guest_id,
      -item.price,
      'Spent',
      { item_id: item.id, item_name: item.name }
    );
    if (updatedWallet) {
      setPlayerData((prev) => (prev ? { ...prev, wallet: updatedWallet } : null));
      setUserInventory((prev) => [...prev, item]);
    }
  };

  const handleBuyProperty = async (property: Property) => {
    if (!playerData) return;
    if (playerData.wallet.cash < property.price) {
      alert('Insufficient funds for this real estate property!');
      return;
    }
    const guest = getOrCreateGuestSession();
    const updatedWallet = await GameDataService.updateWalletBalance(
      playerData.player.id,
      guest.guest_id,
      -property.price,
      'Spent',
      { property_id: property.id, location: property.location }
    );
    if (updatedWallet) {
      setPlayerData((prev) => (prev ? { ...prev, wallet: updatedWallet } : null));
      alert(`Successfully acquired property in ${property.location}!`);
    }
  };

  const handleCreateBusiness = async (name: string, type: string, location: string) => {
    if (!playerData) return;
    const cost = 100000;
    if (playerData.wallet.cash < cost) {
      alert('Business registration requires ₦100,000!');
      return;
    }
    const guest = getOrCreateGuestSession();
    const updatedWallet = await GameDataService.updateWalletBalance(
      playerData.player.id,
      guest.guest_id,
      -cost,
      'Business',
      { business_name: name, type }
    );
    if (updatedWallet) {
      setPlayerData((prev) => (prev ? { ...prev, wallet: updatedWallet } : null));
      setUserBusinesses((prev) => [...prev, { name, type, location, balance: 0 }]);
      alert(`Business "${name}" registered in ${location}!`);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center text-white font-bold text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Entering Ibadan City...</span>
        </div>
      </div>
    );
  }

  if (!playerData) {
    return <CharacterCreator onComplete={handleCharacterComplete} />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-950 font-sans">
      <OrientationPrompt />

      <div ref={mountRef} className="absolute inset-0 z-0" />

      <div className="fixed top-2.5 left-3 right-3 z-20 flex items-center justify-between pointer-events-none flex-wrap gap-2">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="hud-card px-3 py-1.5 flex items-center gap-2 border border-emerald-500/30 text-xs font-bold text-white shadow-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-green" />
            <span>{playerData.player.display_name}</span>
          </div>

          <WalletHUD wallet={playerData.wallet} />

          <div className="hud-card px-3 py-1.5 hidden sm:flex items-center gap-1.5 border border-emerald-500/30 text-xs font-bold text-white shadow-lg">
            <span className="truncate max-w-[120px]">{currentDistrict}</span>
          </div>

          <div className="hud-card px-2.5 py-1.5 border border-amber-500/30 text-[11px] font-bold text-amber-300 shadow-lg">
            {lagosTimeDisplay}
          </div>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setActiveModal('customization')}
            className="hud-button p-2 rounded-xl border border-purple-500/40 text-purple-300 shadow-lg"
            title="Outfit Customization"
          >
            <Shirt className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveModal('travel')}
            className="hud-button px-2.5 py-1.5 rounded-xl border border-teal-500/40 text-teal-300 text-xs font-bold shadow-lg"
            title="Travel Locations"
          >
            TRAVEL
          </button>

          <button
            onClick={() => setActiveModal('map')}
            className="hud-button px-2.5 py-1.5 rounded-xl border border-amber-500/40 text-amber-300 text-xs font-bold shadow-lg"
            title="Interactive Map"
          >
            MAP
          </button>

          <button
            onClick={() => setActiveModal('jobs')}
            className="hud-button p-2 rounded-xl border border-emerald-500/30 text-emerald-400 shadow-lg"
            title="Jobs"
          >
            <Briefcase className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveModal('market')}
            className="hud-button p-2 rounded-xl border border-amber-500/30 text-amber-400 shadow-lg"
            title="Market"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveModal('housing')}
            className="hud-button p-2 rounded-xl border border-blue-500/30 text-blue-400 shadow-lg"
            title="Housing"
          >
            <Home className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveModal('business')}
            className="hud-button p-2 rounded-xl border border-purple-500/30 text-purple-400 shadow-lg"
            title="Business"
          >
            <Building2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <MobileControls
        onMove={(v) => {
          autoWalkTargetRef.current = null;
          moveVectorRef.current = v;
        }}
        onCameraRotate={(d) => { cameraManagerRef.current?.rotateAzimuth(d.x); }}
        onToggleSprint={(s) => { isSprintingRef.current = s; }}
        onJump={() => physicsRef.current.applyJump()}
        onInteract={() => {
          if (localPlayerControllerRef.current && npcManagerRef.current) {
            const pos = localPlayerControllerRef.current.group.position;
            const npcMatch = npcManagerRef.current.getNearestNPC(pos, 3.5);
            if (npcMatch) {
              const text = npcMatch.data.dialogue?.[0] || `Hello from ${npcMatch.data.name}!`;
              realtimeRef.current?.sendChatMessage(`💬 [${npcMatch.data.name}]: ${text}`);
              return;
            }
          }
          if (remotePlayers.length > 0) {
            setSelectedInteractionPlayer(remotePlayers[0]);
          }
        }}
        onOpenMap={() => setActiveModal('map')}
        onOpenTravel={() => setActiveModal('travel')}
        isNearPlayerOrObject={nearestInteraction !== null}
        currentDistrict={currentDistrict}
        lagosTime={lagosTimeDisplay}
      />

      <ChatOverlay
        messages={chatMessages}
        onSendMessage={(t) => realtimeRef.current?.sendChatMessage(t)}
        currentDistrict={currentDistrict}
      />

      {selectedInteractionPlayer && (
        <InteractionMenu
          player={selectedInteractionPlayer}
          onClose={() => setSelectedInteractionPlayer(null)}
          onGreet={(p) => {
            realtimeRef.current?.sendChatMessage(`👋 Greets ${p.display_name}!`);
            setSelectedInteractionPlayer(null);
          }}
          onOpenDirectMessage={() => {
            setSelectedInteractionPlayer(null);
          }}
          onAddFriend={(p) => {
            alert(`Friend request sent to ${p.display_name}!`);
            setSelectedInteractionPlayer(null);
          }}
          onFollow={(p) => {
            alert(`Following ${p.display_name}...`);
            setSelectedInteractionPlayer(null);
          }}
        />
      )}

      {activeModal === 'travel' && (
        <TravelModal
          currentDistrict={currentDistrict}
          playerPosition={[
            localPlayerControllerRef.current?.group.position.x || 0,
            localPlayerControllerRef.current?.group.position.y || 0,
            localPlayerControllerRef.current?.group.position.z || 0
          ]}
          onClose={() => setActiveModal(null)}
          onSelectTravel={handleSelectTravel}
        />
      )}

      {activeModal === 'customization' && (
        <CharacterCustomizationModal
          gender={playerData.character.gender}
          onClose={() => setActiveModal(null)}
          onSelectOutfit={handleSelectOutfit}
        />
      )}

      {activeModal === 'jobs' && (
        <JobsModal jobs={catalogJobs} onClose={() => setActiveModal(null)} onWorkJob={handleWorkJob} />
      )}

      {activeModal === 'market' && (
        <MarketModal items={catalogItems} inventory={userInventory} onClose={() => setActiveModal(null)} onBuyItem={handleBuyItem} />
      )}

      {activeModal === 'housing' && (
        <HousingModal properties={catalogProperties} onClose={() => setActiveModal(null)} onBuyProperty={handleBuyProperty} />
      )}

      {activeModal === 'business' && (
        <BusinessModal businesses={userBusinesses} onClose={() => setActiveModal(null)} onCreateBusiness={handleCreateBusiness} />
      )}

      {activeModal === 'map' && (
        <MapModal
          currentDistrict={currentDistrict}
          playerPosition={[
            localPlayerControllerRef.current?.group.position.x || 0,
            localPlayerControllerRef.current?.group.position.y || 0,
            localPlayerControllerRef.current?.group.position.z || 0
          ]}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}

export default App;
