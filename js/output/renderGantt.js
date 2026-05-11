// ======================================================================
// GANTT CHART RENDERING MODULE
// ======================================================================
//
// This module is responsible for visually rendering the CPU scheduling
// execution timeline (Gantt chart).
//
// It transforms algorithm output into a proportional UI representation
// where each process block reflects its execution duration.
//
// ======================================================================

import { getColor } from "../utils/processColors.js";

// ================================================================
// INSERT IDLE SEGMENTS
// ================================================================
// Ensures that gaps between process executions are visually shown
// as "IDLE" blocks in the Gantt chart.
//
// This improves accuracy of the timeline representation.
//
// INPUT:
// ganttChart = [
//   { id, start, end, duration }
// ]
//
// OUTPUT:
// Modified array including IDLE segments where gaps exist
// ================================================================
function addIdleSegments(ganttChart) {
  const result = [];

  for (let i = 0; i < ganttChart.length; i++) {
    const current = ganttChart[i];

    // First process has no previous comparison
    if (i === 0) {
      result.push(current);
      continue;
    }

    const prev = ganttChart[i - 1];

    // ------------------------------------------------------------
    // Detect CPU idle time (gap between processes)
    // ------------------------------------------------------------
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

// ================================================================
// RENDER GANTT CHART
// ================================================================
// Converts scheduling output into a visual bar-based timeline.
//
// Each process is rendered as a proportional block where:
// - Width is based on execution duration
// - Color represents process identity
// - IDLE time is visually distinct
//
// INPUT:
// ganttChart = [
//   { id, start, end, duration }
// ]
// ================================================================
export function renderGantt(ganttChart) {
  // DOM containers
  const container = document.getElementById("gantt-bar-container");
  const timeline = document.getElementById("gantt-timeline");

  // Clear previous render
  container.innerHTML = "";
  timeline.innerHTML = "";

  // Add IDLE segments for accurate timeline visualization
  const chart = addIdleSegments(ganttChart);

  // ============================================================
  // RENDER GANTT BARS
  // ============================================================
  chart.forEach((item) => {
    const block = document.createElement("div");

    block.classList.add("gantt-block");

    // --------------------------------------------------------
    // Proportional sizing based on execution duration
    // --------------------------------------------------------
    block.style.flexGrow = item.duration;
    block.style.flexBasis = "0%";
    block.style.flexShrink = "1";

    block.textContent = item.id;

    // --------------------------------------------------------
    // Styling for IDLE blocks
    // --------------------------------------------------------
    if (item.id === "IDLE") {
      block.style.background = "#fafafa";
      block.style.color = "#777";
      block.style.fontStyle = "italic";
      block.style.fontSize = "0.9rem";
    } else {
      // Assign consistent color per process
      block.style.background = getColor(item.id);
    }

    container.appendChild(block);
  });

  // ============================================================
  // RENDER TIMELINE LABELS (START TIMES)
  // ============================================================
  chart.forEach((item) => {
    const span = document.createElement("span");

    span.textContent = item.start;

    // Align labels with corresponding blocks
    span.style.flexGrow = item.duration;
    span.style.flexBasis = "0%";
    span.style.flexShrink = "1";

    span.style.textAlign = "left";

    timeline.appendChild(span);
  });

  // ============================================================
  // FINAL END TIME MARKER
  // ============================================================
  const end = document.createElement("span");

  end.textContent = chart[chart.length - 1].end;

  // Prevent distortion of flex scaling
  end.style.flex = "0 0 auto";

  timeline.appendChild(end);
}
