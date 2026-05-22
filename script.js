const texts = [
  "JKVID MAINPAGE",
  "Motion Graphics · VFX · Music",
  "PORTFOLIO",
];

const typedEl = document.getElementById("typed");
let textIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  if (!typedEl) return;

  const current = texts[textIndex];

  if (!deleting) {
    typedEl.textContent = current.slice(0, charIndex++);

    if (charIndex > current.length) {
      deleting = true;
      setTimeout(typeLoop, 1200);
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, charIndex--);

    if (charIndex < 0) {
      deleting = false;
      textIndex = (textIndex + 1) % texts.length;
      charIndex = 0;
    }
  }

  setTimeout(typeLoop, deleting ? 34 : 56);
}

typeLoop();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document
  .querySelectorAll(".reveal, .about-item, .contact-item, .work-showcase")
  .forEach((el) => observer.observe(el));

const coords = document.getElementById("coords");
const modelLogo = document.querySelector(".model-logo-viewer");
const modelFrame = document.querySelector(".model-logo");
let pointerFrame = null;

const cameraState = {
  baseTheta: 0,
  basePhi: 104,
  theta: 0,
  phi: 104,
  targetTheta: 0,
  targetPhi: 104,
  scrollTheta: 0,
};

function setModelOrbit() {
  if (!modelLogo) return;

  cameraState.theta += (cameraState.targetTheta - cameraState.theta) * 0.08;
  cameraState.phi += (cameraState.targetPhi - cameraState.phi) * 0.08;

  modelLogo.setAttribute(
    "camera-orbit",
    `${cameraState.theta.toFixed(2)}deg ${cameraState.phi.toFixed(2)}deg 0.94m`
  );

  requestAnimationFrame(setModelOrbit);
}

function updateModelPointer(event) {
  if (!modelFrame || !modelLogo) return;

  const rect = modelFrame.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  const pointerInside = x > -0.2 && x < 1.2 && y > -0.2 && y < 1.2;

  if (!pointerInside) return;

  cameraState.targetTheta = cameraState.baseTheta + cameraState.scrollTheta + x * 13;
  cameraState.targetPhi = cameraState.basePhi + y * 8;
}

window.addEventListener("mousemove", (event) => {
  updateModelPointer(event);

  if (!coords || pointerFrame) return;

  pointerFrame = requestAnimationFrame(() => {
    coords.textContent = `x: ${event.clientX}, y: ${event.clientY}`;
    pointerFrame = null;
  });
});

window.addEventListener(
  "scroll",
  () => {
    if (!modelLogo) return;

    cameraState.scrollTheta = Math.min(window.scrollY * 0.085, 52);
    cameraState.targetTheta = cameraState.baseTheta + cameraState.scrollTheta;
    cameraState.targetPhi = cameraState.basePhi;
  },
  { passive: true }
);

if (modelLogo) {
  requestAnimationFrame(setModelOrbit);

  modelLogo.addEventListener("load", () => {
    modelLogo.model.materials.forEach((material) => {
      const pbr = material.pbrMetallicRoughness;

      if (material.setAlphaMode) {
        material.setAlphaMode("BLEND");
      }

      pbr.setBaseColorFactor([0.68, 0.9, 1, 0.92]);
      pbr.setMetallicFactor(0.04);
      pbr.setRoughnessFactor(0.16);

      if (material.setEmissiveFactor) {
        material.setEmissiveFactor([0.012, 0.028, 0.045]);
      }
    });
  });
}
