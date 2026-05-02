const processColors = {};

const retroPalette = [
  [180, 30, 35], // teal
  [30, 40, 38], // amber
  [260, 25, 40], // violet
  [140, 25, 35], // green
  [210, 20, 40], // slate blue
  [10, 35, 38], // coral
  [200, 15, 25], // steel
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
