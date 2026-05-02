import { getColor } from "../utils/processColors.js";

let isSimulating = false;

function addIdleSegments(ganttChart) {
  const result = [];

  for (let i = 0; i < ganttChart.length; i++) {
    const current = ganttChart[i];

    if (i === 0) {
      result.push(current);
      continue;
    }

    const prev = ganttChart[i - 1];

    if (current.start > prev.end) {
      result.push({
        id: "IDLE",
        start: prev.end,
        end: current.start,
        duration: current.start - prev.end,
      });
    }

    result.push(current);
  }

  return result;
}

export async function simulateGantt(ganttChart, speed = 750) {
  if (isSimulating) return;
  isSimulating = true;

  const container = document.getElementById("gantt-bar-container");
  const timeline = document.getElementById("gantt-timeline");

  container.innerHTML = "";
  timeline.innerHTML = "";

  const chart = addIdleSegments(ganttChart);

  for (let i = 0; i < chart.length; i++) {
    const item = chart[i];

    // === CREATE BLOCK ===
    const block = document.createElement("div");
    block.classList.add("gantt-block");

    block.style.flexGrow = item.duration;
    block.style.flexBasis = "0%";
    block.style.flexShrink = "1";

    block.textContent = item.id;

    if (item.id === "IDLE") {
      block.style.background = "#fafafa";
      block.style.color = "#777";
      block.style.fontStyle = "italic";
    } else {
      block.style.background = getColor(item.id);
    }

    container.appendChild(block);

    // === CREATE TIMELINE START ===
    const span = document.createElement("span");
    span.textContent = item.start;

    span.style.flexGrow = item.duration;
    span.style.flexBasis = "0%";
    span.style.flexShrink = "1";

    span.style.textAlign = "left";

    timeline.appendChild(span);

    // === ANIMATION DELAY ===
    await new Promise((resolve) => setTimeout(resolve, item.duration * speed));
  }

  // === FINAL TIME ===
  const end = document.createElement("span");
  end.textContent = chart[chart.length - 1].end;
  end.style.flex = "0 0 auto";

  timeline.appendChild(end);

  isSimulating = false;
}
