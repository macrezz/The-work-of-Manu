console.log('Starting ISS Tracker');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// EARTH
const EARTH_RADIUS = 6.371;
const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);

const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = "anonymous";

const earthMaterial = new THREE.MeshPhongMaterial({ 
  color: 0x4488ff,
  shininess: 15,
  specular: 0x333333,
  emissive: 0x111133,
  emissiveIntensity: 0.2
});

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

textureLoader.load(
  'https://unpkg.com/three-globe@2.24.3/example/img/earth-blue-marble.jpg',
  (texture) => {
    console.log('Earth texture loaded');
    earthMaterial.map = texture;
    earthMaterial.color.setHex(0xffffff);
    earthMaterial.emissive.setHex(0x222244);
    earthMaterial.emissiveIntensity = 0.3;
    earthMaterial.needsUpdate = true;
  },
  undefined,
  (error) => {
    console.warn('Earth texture failed, using bright blue');
  }
);

// Atmosphere
const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS + 0.15, 64, 64);
const atmosphereMaterial = new THREE.MeshBasicMaterial({
  color: 0x88ccff,
  transparent: true,
  opacity: 0.25,
  side: THREE.BackSide
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
scene.add(atmosphere);

const issGroup = new THREE.Group();
const ISS_SCALE = 7; 

const mainModuleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.08, 16);
const mainModuleMaterial = new THREE.MeshPhongMaterial({ 
  color: 0xcccccc,
  metalness: 0.3,
  shininess: 30
});
const mainModule = new THREE.Mesh(mainModuleGeometry, mainModuleMaterial);
mainModule.rotation.z = Math.PI / 2;
issGroup.add(mainModule);

const module2Geometry = new THREE.CylinderGeometry(0.015, 0.015, 0.06, 16);
const module2 = new THREE.Mesh(module2Geometry, mainModuleMaterial);
module2.rotation.z = Math.PI / 2;
module2.position.x = 0.05;
issGroup.add(module2);

const module3 = new THREE.Mesh(module2Geometry, mainModuleMaterial);
module3.rotation.z = Math.PI / 2;
module3.position.x = -0.05;
issGroup.add(module3);

const trussGeometry = new THREE.BoxGeometry(0.15, 0.005, 0.005);
const trussMaterial = new THREE.MeshPhongMaterial({ 
  color: 0x888888,
  metalness: 0.5
});
const truss = new THREE.Mesh(trussGeometry, trussMaterial);
truss.position.y = 0.015;
issGroup.add(truss);

// Solar panel creation function
const createSolarPanel = (xPos, yPos) => {
  const panelGroup = new THREE.Group();
  
  const panelGeometry = new THREE.BoxGeometry(0.06, 0.002, 0.04);
  const panelMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x1a3d6f,
    emissive: 0x001133,
    emissiveIntensity: 0.3,
    shininess: 60
  });
  const panel = new THREE.Mesh(panelGeometry, panelMaterial);
  panelGroup.add(panel);
  
  const frameGeometry = new THREE.BoxGeometry(0.061, 0.003, 0.041);
  const frameMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xaaaaaa,
    transparent: true,
    opacity: 0.5,
    side: THREE.BackSide
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  panelGroup.add(frame);
  
  const gridMaterial = new THREE.LineBasicMaterial({ color: 0x000033, opacity: 0.5, transparent: true });
  
  // Vertical grid lines
  for (let i = -0.025; i <= 0.025; i += 0.01) {
    const gridGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, 0.0015, -0.02),
      new THREE.Vector3(i, 0.0015, 0.02)
    ]);
    const line = new THREE.Line(gridGeometry, gridMaterial);
    panelGroup.add(line);
  }
  
  // Horizontal grid lines
  for (let i = -0.018; i <= 0.018; i += 0.01) {
    const gridGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.025, 0.0015, i),
      new THREE.Vector3(0.025, 0.0015, i)
    ]);
    const line = new THREE.Line(gridGeometry, gridMaterial);
    panelGroup.add(line);
  }
  
  panelGroup.position.set(xPos, yPos, 0);
  return panelGroup;
};

const leftPanel1 = createSolarPanel(-0.08, 0.015);
issGroup.add(leftPanel1);

const leftPanel2 = createSolarPanel(-0.08, -0.015);
issGroup.add(leftPanel2);

const rightPanel1 = createSolarPanel(0.08, 0.015);
issGroup.add(rightPanel1);

const rightPanel2 = createSolarPanel(0.08, -0.015);
issGroup.add(rightPanel2);

const radiatorGeometry = new THREE.BoxGeometry(0.04, 0.001, 0.02);
const radiatorMaterial = new THREE.MeshPhongMaterial({ 
  color: 0xffffff,
  emissive: 0x222222,
  emissiveIntensity: 0.1
});

const radiator1 = new THREE.Mesh(radiatorGeometry, radiatorMaterial);
radiator1.position.set(0.02, 0.03, 0);
issGroup.add(radiator1);

const radiator2 = new THREE.Mesh(radiatorGeometry, radiatorMaterial);
radiator2.position.set(-0.02, 0.03, 0);
issGroup.add(radiator2);

const antennaGeometry = new THREE.CylinderGeometry(0.008, 0.01, 0.002, 16);
const antennaMaterial = new THREE.MeshPhongMaterial({ 
  color: 0xdddddd,
  metalness: 0.7
});
const antenna1 = new THREE.Mesh(antennaGeometry, antennaMaterial);
antenna1.position.set(0, 0.025, 0.03);
issGroup.add(antenna1);

const issLight = new THREE.PointLight(0xffffcc, 1.5, 20);
issGroup.add(issLight);

issGroup.scale.set(ISS_SCALE, ISS_SCALE, ISS_SCALE);

scene.add(issGroup);

setTimeout(() => {
  document.getElementById('controls').innerHTML = `
    <strong>Controls:</strong><br>
    Drag to rotate view<br>
    Scroll to zoom in/out<br>
    Realistic ISS model loaded!
  `;
}, 1000);

// PAST ORBIT TRAIL
const pastOrbitPoints = [];
let pastOrbitLine;

function updatePastOrbitLine() {
  if (pastOrbitPoints.length < 2) return;
  
  if (pastOrbitLine) {
    scene.remove(pastOrbitLine);
  }
  
  const curve = new THREE.CatmullRomCurve3(pastOrbitPoints);
  const tubeGeometry = new THREE.TubeGeometry(curve, pastOrbitPoints.length * 2, 0.015, 8, false);
  const tubeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff6666,
    transparent: true,
    opacity: 0.7
  });
  
  pastOrbitLine = new THREE.Mesh(tubeGeometry, tubeMaterial);
  scene.add(pastOrbitLine);
}

// FUTURE ORBIT PREDICTION
let futureOrbitLine;

function createFutureOrbitLine(points) {
  if (futureOrbitLine) {
    scene.remove(futureOrbitLine);
  }
  
  if (points.length < 2) return;
  
  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, points.length * 2, 0.02, 8, false);
  const tubeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff0000,
    transparent: true,
    opacity: 0.9
  });
  
  futureOrbitLine = new THREE.Mesh(tubeGeometry, tubeMaterial);
  scene.add(futureOrbitLine);
  
  console.log(`Created future orbit path (2 hour) with ${points.length} points`);
}

// Connection line
const lineMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x00ff00,
  transparent: true,
  opacity: 0.5
});
let connectionLine;

// LIGHTING
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const sunLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight1.position.set(30, 20, 20);
scene.add(sunLight1);

const sunLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
sunLight2.position.set(-30, 10, -20);
scene.add(sunLight2);

const sunLight3 = new THREE.DirectionalLight(0xffffff, 0.6);
sunLight3.position.set(0, -20, 0);
scene.add(sunLight3);

// Stars
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ 
  color: 0xffffff, 
  size: 0.08,
  transparent: true,
  opacity: 0.9
});
const starVertices = [];
for (let i = 0; i < 6000; i++) {
  starVertices.push(
    (Math.random() - 0.5) * 1000,
    (Math.random() - 0.5) * 1000,
    (Math.random() - 0.5) * 1000
  );
}
starGeometry.setAttribute('position', 
  new THREE.Float32BufferAttribute(starVertices, 3)
);
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

camera.position.set(0, 5, 25);
camera.lookAt(0, 0, 0);

console.log('Scene setup complete');

// Helper function
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  
  return new THREE.Vector3(x, y, z);
}

// State variables
let lastLat = null;
let lastLon = null;
let tleData = null;

// Get data
async function getTLEData() {
  try {
    console.log('Fetching TLE data for orbit prediction');
    const response = await fetch('https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE');
    const text = await response.text();
    const lines = text.trim().split('\n');
    
    if (lines.length >= 3) {
      tleData = {
        line1: lines[1],
        line2: lines[2]
      };
      console.log('TLE data received');
      return true;
    }
  } catch (error) {
    console.error('Failed to get TLE data:', error);
  }
  return false;
}

// Predict future orbit
function predictFutureOrbit(currentLat, currentLon) {
  if (!tleData) {
    console.log('No TLE data available for prediction');
    return [];
  }

  try {
    const satrec = satellite.twoline2satrec(tleData.line1, tleData.line2);
    const futurePoints = [];
    const now = new Date();
    
    const minutesInFuture = 2*60;
    const stepMinutes = 2;
    
    for (let i = 0; i <= minutesInFuture; i += stepMinutes) {
      const futureTime = new Date(now.getTime() + i * 60 * 1000);
      const positionAndVelocity = satellite.propagate(satrec, futureTime);
      
      if (positionAndVelocity.position && !positionAndVelocity.position.error) {
        const positionEci = positionAndVelocity.position;
        const gmst = satellite.gstime(futureTime);
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        
        const lat = satellite.degreesLat(positionGd.latitude);
        const lon = satellite.degreesLong(positionGd.longitude);
        const altKm = positionGd.height;
        
        const issDistance = EARTH_RADIUS + (altKm / 6371) * EARTH_RADIUS;
        const point = latLonToVector3(lat, lon, issDistance);
        futurePoints.push(point);
      }
    }
    
    console.log(` Predicted ${futurePoints.length} future positions (next 2 hour)`);
    return futurePoints;
    
  } catch (error) {
    console.error('Error predicting orbit:', error);
    return [];
  }
}

// Update ISS position
async function updateISSPosition() {
  try {
    console.log('Fetching ISS data');
    document.getElementById('status').textContent = '● Fetching data';
    document.getElementById('status').style.color = '#ff0';
    
    let data;
    
    try {
      const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
      if (response.ok) {
        const issData = await response.json();
        data = {
          iss_position: {
            latitude: issData.latitude.toString(),
            longitude: issData.longitude.toString()
          },
          timestamp: Math.floor(Date.now() / 1000)
        };
        console.log('Got data from wheretheiss.at');
      }
    } catch (e) {
      console.log('wheretheiss.at failed:', e.message);
    }
     
    if (!data || !data.iss_position) {
      throw new Error('Failed to fetch ISS data');
    }
    
    const lat = parseFloat(data.iss_position.latitude);
    const lon = parseFloat(data.iss_position.longitude);
    const altitudeKm = 408;
    
    console.log(`ISS at: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`);
    
    const positionChanged = (lastLat !== lat || lastLon !== lon);
    
    if (positionChanged) {
      console.log('ISS position changed, updating');
      
      const issDistance = EARTH_RADIUS + (altitudeKm / 6371) * EARTH_RADIUS;
      const issPos = latLonToVector3(lat, lon, issDistance);
      
      issGroup.position.copy(issPos);
      
      const earthCenter = new THREE.Vector3(0, 0, 0);
      issGroup.lookAt(earthCenter);
      issGroup.rotateX(Math.PI / 2);
      
      if (connectionLine) {
        scene.remove(connectionLine);
      }
      const linePoints = [new THREE.Vector3(0, 0, 0), issPos];
      const lineCurve = new THREE.CatmullRomCurve3(linePoints);
      const lineGeometry = new THREE.TubeGeometry(lineCurve, 20, 0.015, 8, false);
      connectionLine = new THREE.Mesh(lineGeometry, lineMaterial);
      scene.add(connectionLine);
      
      pastOrbitPoints.push(issPos.clone());
      if (pastOrbitPoints.length > 300) {
        pastOrbitPoints.shift();
      }
      updatePastOrbitLine();
      
      lastLat = lat;
      lastLon = lon;
      
      if (!tleData) {
        await getTLEData();
      }
      
      if (tleData) {
        const futurePoints = predictFutureOrbit(lat, lon);
        if (futurePoints.length > 0) {
          createFutureOrbitLine(futurePoints);
        }
      }
    } else {
      console.log('ISS position unchanged, skipping update');
    }
    
    document.getElementById('lat').textContent = lat.toFixed(4) + '°';
    document.getElementById('lon').textContent = lon.toFixed(4) + '°';
    document.getElementById('alt').textContent = altitudeKm.toFixed(0) + ' km';
    
    const now = new Date();
    document.getElementById('status').textContent = 
      `Live - ${now.toLocaleTimeString()}`;
    document.getElementById('status').style.color = '#0f0';
    
    console.log('Update complete! Past points: ' + pastOrbitPoints.length);
    
  } catch (error) {
    console.error(' Error:', error);
    document.getElementById('status').textContent = 'Error: ' + error.message;
    document.getElementById('status').style.color = '#f00';
  }
}

// Mouse controls
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let autoRotate = true;

renderer.domElement.addEventListener('mousedown', (e) => {
  isDragging = true;
  autoRotate = false;
  previousMousePosition = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;
    
    const rotationSpeed = 0.005;
    
    const newX = camera.position.x * Math.cos(deltaX * rotationSpeed) - 
                 camera.position.z * Math.sin(deltaX * rotationSpeed);
    const newZ = camera.position.x * Math.sin(deltaX * rotationSpeed) + 
                 camera.position.z * Math.cos(deltaX * rotationSpeed);
    camera.position.x = newX;
    camera.position.z = newZ;
    
    camera.position.y += deltaY * 0.05;
    camera.position.y = Math.max(-30, Math.min(30, camera.position.y));
    
    camera.lookAt(0, 0, 0);
    previousMousePosition = { x: e.clientX, y: e.clientY };
  }
});

renderer.domElement.addEventListener('mouseup', () => {
  isDragging = false;
  setTimeout(() => { autoRotate = true; }, 3000);
});

renderer.domElement.addEventListener('wheel', (e) => {
  e.preventDefault();
  const direction = camera.position.clone().normalize();
  
  if (e.deltaY > 0) {
    camera.position.addScaledVector(direction, 1);
  } else {
    camera.position.addScaledVector(direction, -1);
  }
  
  const distance = camera.position.length();
  if (distance < 10) camera.position.setLength(10);
  else if (distance > 50) camera.position.setLength(50);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  if (autoRotate) {
    const rotationSpeed = 0.001;
    const newX = camera.position.x * Math.cos(rotationSpeed) - 
                 camera.position.z * Math.sin(rotationSpeed);
    const newZ = camera.position.x * Math.sin(rotationSpeed) + 
                 camera.position.z * Math.cos(rotationSpeed);
    camera.position.x = newX;
    camera.position.z = newZ;
    camera.lookAt(0, 0, 0);
  }
    
  const glowSphere = issGroup.children[issGroup.children.length - 2];
  if (glowSphere) {
    const time = Date.now() * 0.002;
    const pulse = 1 + Math.sin(time) * 0.2;
    glowSphere.scale.set(pulse, pulse, pulse);
  }
  
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log('Starting animation');
animate();

console.log('Fetching initial ISS position and TLE data');
updateISSPosition();

setInterval(updateISSPosition, 5000);

console.log('ISS Tracker ready!');
