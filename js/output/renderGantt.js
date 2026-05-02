import { getColor } from "../utils/processColors.js";

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

// Renders the Gantt chart based on the algorithm's output
export function renderGantt(ganttChart) {
  const container = document.getElementById("gantt-bar-container");
  const timeline = document.getElementById("gantt-timeline");

  container.innerHTML = "";
  timeline.innerHTML = "";
  const chart = addIdleSegments(ganttChart);

  chart.forEach((item, index) => {
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
      block.style.fontSize = "0.9rem";
    } else {
      block.style.background = getColor(item.id);
    }

    container.appendChild(block);
  });

  chart.forEach((item) => {
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
  end.textContent = chart[chart.length - 1].end;

  // keep it non-flex so it doesn't distort scaling
  end.style.flex = "0 0 auto";

  timeline.appendChild(end);
}
