// ====== Sounds setup ======
const sounds = {
  crystals: document.getElementById('crystal-sound'),
  spools: document.getElementById('spool-sound'),
  shells: document.getElementById('shell-sound'),
  botanicals: document.getElementById('botanical-sound'),
  jars: document.getElementById('jar-sound'),
  boxes: document.getElementById('box-sound'),
};

// ====== Filter Buttons ======
const filterButtons = document.querySelectorAll('.filter-btn');
const trinkets = document.querySelectorAll('.trinket');

function applyFilter(category) {
  trinkets.forEach(t => {
    if (t.parentElement.id !== 'trinket-bar') {
      t.style.display = 'block';
    } else {
      if (category === 'all' || t.dataset.category === category) {
        t.style.display = 'block';
      } else {
        t.style.display = 'none';
      }
    }
  });
}

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active').classList.remove('active');
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

// Start with all visible
applyFilter('all');

// ====== Drag and Drop Setup ======
const dropzones = document.querySelectorAll('.dropzone');
const trinketBar = document.getElementById('trinket-bar');

let isHolding = false;
let currentTrinket = null;
let originalPosition = {};
let originalParent = null;
let originalIndex = null;
let offsetX = 0;
let offsetY = 0;
let hoveringZone = null;

function makeTrinketDraggable(trinket) {
  trinket.addEventListener('mousedown', (e) => {
    isHolding = true;
    currentTrinket = trinket;
    originalParent = trinket.parentElement;
    originalIndex = Array.from(originalParent.children).indexOf(trinket);

    const rect = trinket.getBoundingClientRect();

    originalPosition = {
      left: rect.left,
      top: rect.top,
      width: trinket.offsetWidth,
      height: trinket.offsetHeight
    };

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    trinket.classList.add('held');
    trinket.style.zIndex = 1000;
    trinket.style.pointerEvents = 'none';
    document.body.appendChild(trinket);
    trinket.style.position = 'fixed';
    trinket.style.left = `${rect.left}px`;
    trinket.style.top = `${rect.top}px`;
    trinket.style.width = `${trinket.offsetWidth}px`;
    trinket.style.height = 'auto';

    e.preventDefault();
  });
}

function getFittedSize(zone, img) {
  const zoneWidth = zone.offsetWidth;
  const zoneHeight = zone.offsetHeight;
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;
  const aspectRatio = naturalHeight / naturalWidth;

  // Start by assuming width = zone width
  let width = zoneWidth;
  let height = width * aspectRatio;

  // If height too big, fit by height instead
  if (height > zoneHeight) {
    height = zoneHeight;
    width = height / aspectRatio;
  }

  return { width, height };
}

document.addEventListener('mousemove', (e) => {
  if (!isHolding || !currentTrinket) return;

  if (!hoveringZone) {
    currentTrinket.style.left = `${e.clientX - offsetX}px`;
    currentTrinket.style.top = `${e.clientY - offsetY}px`;
    currentTrinket.style.transform = 'scale(1.1)';
    currentTrinket.style.width = originalPosition.width + 'px';
    currentTrinket.style.height = 'auto';
  } else {
    const zoneRect = hoveringZone.getBoundingClientRect();
    const { width, height } = getFittedSize(hoveringZone, currentTrinket);

    currentTrinket.style.left = `${zoneRect.left}px`;
    currentTrinket.style.top = `${zoneRect.top + hoveringZone.offsetHeight - height}px`;
    currentTrinket.style.width = `${width}px`;
    currentTrinket.style.height = `${height}px`;
    currentTrinket.style.transform = 'scale(1.1)';
  }
});

document.addEventListener('mouseup', (e) => {
  if (!isHolding || !currentTrinket) return;

  let dropped = false;

  dropzones.forEach(zone => {
    const rect = zone.getBoundingClientRect();
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      const rotation = zone.getAttribute('data-rotation') || '0deg';
      const { width, height } = getFittedSize(zone, currentTrinket);

      zone.appendChild(currentTrinket);
      currentTrinket.style.position = 'absolute';
      currentTrinket.style.left = `0px`;
      currentTrinket.style.top = `${zone.offsetHeight - height}px`;
      currentTrinket.style.width = `${width}px`;
      currentTrinket.style.height = `${height}px`;
      currentTrinket.style.transform = `rotate(${rotation})`;

      // Play sound by category
      const soundToPlay = sounds[currentTrinket.dataset.category];
      if (soundToPlay) {
        soundToPlay.currentTime = 0;
        soundToPlay.play();
      }

      currentTrinket.classList.remove('held');
      currentTrinket.style.zIndex = 10;
      currentTrinket.style.pointerEvents = '';
      makeTrinketDraggable(currentTrinket);
      dropped = true;
    }
  });

  if (!dropped) {
    currentTrinket.classList.remove('held');
    currentTrinket.style.position = '';
    currentTrinket.style.left = '';
    currentTrinket.style.top = '';
    currentTrinket.style.width = '';
    currentTrinket.style.height = '';
    currentTrinket.style.transform = '';
    currentTrinket.style.zIndex = '';
    currentTrinket.style.pointerEvents = '';
    originalParent.insertBefore(currentTrinket, originalParent.children[originalIndex]);
  }

  isHolding = false;
  currentTrinket = null;
  hoveringZone = null;
  dropzones.forEach(zone => zone.classList.remove('highlight'));
});

dropzones.forEach(zone => {
  zone.addEventListener('mouseenter', () => {
    if (isHolding) {
      zone.classList.add('highlight');
      hoveringZone = zone;
    }
  });

  zone.addEventListener('mouseleave', () => {
    zone.classList.remove('highlight');
    hoveringZone = null;
  });
});

document.querySelectorAll('.trinket').forEach(makeTrinketDraggable);

// Scroll buttons for the trinket bar
document.getElementById('scroll-left').addEventListener('click', () => {
  trinketBar.scrollBy({
    left: -200,
    behavior: 'smooth'
  });
});

document.getElementById('scroll-right').addEventListener('click', () => {
  trinketBar.scrollBy({
    left: 200,
    behavior: 'smooth'
  });
});

