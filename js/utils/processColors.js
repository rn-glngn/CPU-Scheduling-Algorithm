const processColors = {};

const retroPalette = [
  [180, 35, 45], // teal (brighter, more vivid)
  [30, 50, 45], // amber (pops more)
  [260, 35, 48], // violet (less dull)
  [140, 35, 42], // green (cleaner)
  [210, 30, 48], // slate blue (more visible)
  [10, 45, 45], // coral (warmer)
  [50, 65, 40], // darker golden yellow
];

function normalizeId(id) {
  return String(id).trim().toUpperCase();
}

export function getColor(processId) {
  const id = normalizeId(processId);

  if (processColors[id]) return processColors[id];

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % retroPalette.length;
  const [h, s, l] = retroPalette[index];

  const lightnessOffset = (Math.abs(hash) % 10) - 8; // -8 to +8

  const color = `hsl(${h}, ${s}%, ${l + lightnessOffset}%)`;

  processColors[id] = color;

  return color;
}
