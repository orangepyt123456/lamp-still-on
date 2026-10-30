import * as THREE from "../vendor/three.module.js";

export function createCourier(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (error) {
    return { ok: false, setSpeaking() {}, lookAt() {}, resize() {} };
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0.15, 1.25, 4.15);
  camera.lookAt(0, 1.05, 0);

  scene.add(new THREE.HemisphereLight(0xffe4c4, 0x2a160f, 0.72));
  const key = new THREE.DirectionalLight(0xfff3e2, 1.25);
  key.position.set(1.4, 3.2, 2.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.4;
  key.shadow.camera.far = 8;
  key.shadow.camera.left = -2;
  key.shadow.camera.right = 2;
  key.shadow.camera.top = 2;
  key.shadow.camera.bottom = -2;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9ec4ff, 0.38);
  rim.position.set(-2.2, 1.6, -1.4);
  scene.add(rim);

  const cloth = new THREE.MeshStandardMaterial({ color: 0x3a2e28, roughness: 0.86 });
  const clothDark = new THREE.MeshStandardMaterial({ color: 0x241c18, roughness: 0.9 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xc6865a, roughness: 0.62 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x1a120e, roughness: 0.8 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc6a15b, metalness: 0.55, roughness: 0.32 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0xffc48a,
    emissive: 0xff7a2a,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.9,
    roughness: 0.2
  });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a100c, roughness: 0.5 });

  const figure = new THREE.Group();
  scene.add(figure);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 0.92, 20), cloth);
  torso.position.y = 0.92;
  torso.castShadow = true;
  figure.add(torso);

  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.1, 16), clothDark);
  collar.position.y = 1.36;
  figure.add(collar);

  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.018, 8, 24), brass);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.7;
  figure.add(belt);

  [-0.1, 0.1].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.48, 12), clothDark);
    leg.position.set(x, 0.26, 0.02);
    leg.castShadow = true;
    figure.add(leg);
    const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 12), dark);
    shoe.scale.set(1.3, 0.55, 1.8);
    shoe.position.set(x, 0.04, 0.06);
    figure.add(shoe);
  });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 28, 22), skin);
  head.scale.set(0.92, 1.05, 0.88);
  head.position.y = 1.58;
  head.castShadow = true;
  figure.add(head);

  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), clothDark);
  cap.position.y = 1.68;
  figure.add(cap);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.025, 24), clothDark);
  brim.position.y = 1.66;
  figure.add(brim);

  const hairFront = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), hair);
  hairFront.position.set(0.12, 1.66, 0.18);
  figure.add(hairFront);

  const eyeGeo = new THREE.SphereGeometry(0.026, 12, 10);
  const leftEye = new THREE.Mesh(eyeGeo, dark);
  const rightEye = new THREE.Mesh(eyeGeo, dark);
  leftEye.position.set(-0.075, 1.6, 0.2);
  rightEye.position.set(0.075, 1.6, 0.2);
  figure.add(leftEye, rightEye);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), skin);
  nose.position.set(0, 1.53, 0.22);
  figure.add(nose);

  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 10), dark);
  mouth.scale.set(1.35, 0.28, 0.45);
  mouth.position.set(0, 1.45, 0.21);
  figure.add(mouth);

  const satchel = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.08), clothDark);
  satchel.position.set(0.22, 0.95, 0.16);
  satchel.rotation.z = -0.15;
  figure.add(satchel);
  const strap = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.012, 6, 20, Math.PI), brass);
  strap.rotation.z = Math.PI / 2.4;
  strap.rotation.y = 0.4;
  strap.position.set(0.05, 1.15, 0.08);
  figure.add(strap);

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.42, 12), cloth);
  arm.position.set(-0.34, 1.05, 0.08);
  arm.rotation.z = 0.45;
  arm.castShadow = true;
  figure.add(arm);

  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), skin);
  hand.position.set(-0.48, 0.86, 0.12);
  figure.add(hand);

  const lanternPivot = new THREE.Group();
  lanternPivot.position.set(-0.5, 0.84, 0.16);
  figure.add(lanternPivot);

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.008, 6, 16), brass);
  handle.position.y = 0.16;
  lanternPivot.add(handle);
  const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.04, 12), brass);
  capTop.position.y = 0.08;
  lanternPivot.add(capTop);
  const lanternGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.075, 0.16, 12), glass);
  lanternPivot.add(lanternGlass);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.03, 12), brass);
  base.position.y = -0.09;
  lanternPivot.add(base);
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff1c9 }));
  flame.position.y = 0.03;
  lanternPivot.add(flame);

  const lampLight = new THREE.PointLight(0xff8a3a, 2.2, 3.2, 2);
  scene.add(lampLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(1.15, 48),
    new THREE.MeshStandardMaterial({ color: 0x2a1c14, roughness: 0.94 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.98, 0.012, 8, 64),
    new THREE.MeshStandardMaterial({ color: 0xd7b074, metalness: 0.45, roughness: 0.4, emissive: 0x3a2a12, emissiveIntensity: 0.4 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.008;
  scene.add(ring);

  let speaking = false;
  let look = 0;
  let lookTarget = 0;
  let drag = 0;
  let dragging = false;
  let lastX = 0;
  const clock = new THREE.Clock();
  const lampWorld = new THREE.Vector3();

  function frame() {
    const t = clock.getElapsedTime();
    look += (lookTarget - look) * 0.06;
    figure.rotation.y = drag + look + Math.sin(t * 0.45) * 0.04;
    torso.scale.y = 1 + Math.sin(t * 1.7) * 0.012;
    lanternPivot.rotation.z = Math.sin(t * 1.4) * 0.08;
    flame.scale.y = 1 + Math.sin(t * 11) * 0.18;
    lanternGlass.getWorldPosition(lampWorld);
    lampLight.position.copy(lampWorld);
    lampLight.intensity = 1.8 + Math.sin(t * 9) * 0.25;
    const phase = t % 4.2;
    const blink = phase > 4.02 ? 0.08 : 1;
    leftEye.scale.y = blink;
    rightEye.scale.y = blink;
    const open = speaking ? 0.35 + Math.abs(Math.sin(t * 16)) * 0.95 : 0.28;
    mouth.scale.y += (open - mouth.scale.y) * 0.35;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  frame();

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  canvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    lastX = event.clientX;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    drag += (event.clientX - lastX) * 0.01;
    lastX = event.clientX;
  });
  canvas.addEventListener("pointerup", () => {
    dragging = false;
  });

  const observer = new ResizeObserver(resize);
  if (canvas.parentElement) observer.observe(canvas.parentElement);
  resize();

  return {
    ok: true,
    setSpeaking(value) {
      speaking = value;
    },
    lookAt(value) {
      lookTarget = value;
    },
    resize
  };
}
