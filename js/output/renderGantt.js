// Color generation based on process ID for consistent Gantt chart coloring
const processColors = {};

function normalizeId(id) {
  return String(id).trim().toUpperCase();
}

const retroPalette = [
  [180, 30, 35], // teal
  [30, 40, 38], // amber
  [260, 25, 40], // violet
  [140, 25, 35], // green
  [210, 20, 40], // slate blue
  [10, 35, 38], // coral
  [200, 15, 25], // steel
];

function getColor(processId) {
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

// Renders the Gantt chart based on the algorithm's output
export function renderGantt(ganttChart) {
  const container = document.getElementById("gantt-bar-container");
  const timeline = document.getElementById("gantt-timeline");

  container.innerHTML = "";
  timeline.innerHTML = "";

  ganttChart.forEach((item, index) => {
    const block = document.createElement("div");
    block.classList.add("gantt-block");

    block.style.flexGrow = item.duration;
    block.style.flexBasis = "0%";
    block.style.flexShrink = "1";

    block.textContent = item.id;

    block.style.background = getColor(item.id);
    container.appendChild(block);
  });

  ganttChart.forEach((item) => {
    const span = document.createElement("span");

    span.textContent = item.start;

    // Match block scaling
    span.style.flexGrow = item.duration;
    span.style.flexBasis = "0%";
    span.style.flexShrink = "1";

    span.style.textAlign = "left";

    timeline.appendChild(span);
  });

  // Final Endpoint
  const end = document.createElement("span");
  end.textContent = ganttChart[ganttChart.length - 1].end;

  // keep it non-flex so it doesn't distort scaling
  end.style.flex = "0 0 auto";

  timeline.appendChild(end);
}
