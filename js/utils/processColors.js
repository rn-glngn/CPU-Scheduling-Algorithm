// ======================================================================
// PROCESS COLOR UTILITY MODULE
// ======================================================================
//
// This module generates and stores consistent colors for processes
// used in the Gantt chart visualization.
//
// PURPOSE:
// • Each process receives a unique color
// • Colors remain consistent across renders/simulations
// • Improves readability of scheduling visualization
//
// Example:
// P1 → teal
// P2 → violet
// P3 → amber
//
// ======================================================================

// Stores generated colors
const processColors = {};

// Retro-inspired HSL palette
const retroPalette = [
  [180, 35, 45], // teal
  [30, 50, 45], // amber
  [260, 35, 48], // violet
  [140, 35, 42], // green
  [210, 30, 48], // slate blue
  [10, 45, 45], // coral
  [50, 65, 40], // golden yellow
];

// Normalizes process IDs for consistency
function normalizeId(id) {
  return String(id).trim().toUpperCase();
}

// Returns a consistent color for a process ID
export function getColor(processId) {
  const id = normalizeId(processId);

  // Return cached color if available
  if (processColors[id]) return processColors[id];

  // Generate hash from process ID
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Select color from palette
  const index = Math.abs(hash) % retroPalette.length;

  const [h, s, l] = retroPalette[index];

  // Small brightness variation
  const lightnessOffset = (Math.abs(hash) % 10) - 8;

  // Final HSL color
  const color = `hsl(${h}, ${s}%, ${l + lightnessOffset}%)`;

  // Cache generated color
  processColors[id] = color;

  return color;
}
