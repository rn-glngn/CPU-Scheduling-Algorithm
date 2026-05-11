// ======================================================================
// GANTT CHART SIMULATION MODULE
// ======================================================================
//
// This module animates the execution of CPU scheduling algorithms
// using a dynamic Gantt chart visualization.
//
// Instead of rendering the entire chart instantly,
// blocks are displayed progressively based on execution duration.
//
// This creates a simulation effect that visually demonstrates:
// • Process execution order
// • CPU idle time
// • Scheduling behavior over time
//
// ======================================================================

import { getColor } from "../utils/processColors.js";

// ================================================================
// SIMULATION STATE FLAG
// ================================================================
// Prevents multiple simulations from running simultaneously
let isSimulating = false;

// ================================================================
// INSERT IDLE SEGMENTS
// ================================================================
// Detects gaps between process executions and inserts
// "IDLE" segments into the Gantt chart.
//
// This ensures accurate CPU timeline visualization.
//
// INPUT:
// ganttChart = [
//   { id, start, end, duration }
// ]
//
// OUTPUT:
// Updated chart including IDLE blocks
// ================================================================
function addIdleSegments(ganttChart) {
  const result = [];

  for (let i = 0; i < ganttChart.length; i++) {
    const current = ganttChart[i];

    // First segment has no previous comparison
    if (i === 0) {
      result.push(current);
      continue;
    }

    const prev = ganttChart[i - 1];

    // ------------------------------------------------------------
    // Detect CPU idle gap
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
// SIMULATE GANTT CHART
// ================================================================
// Animates process execution blocks one at a time.
//
// PARAMETERS:
// ganttChart → scheduling output
// speed      → animation speed multiplier (default = 750ms)
//
// FUNCTIONALITY:
// • Clears old chart
// • Adds blocks progressively
// • Waits based on process duration
// • Displays execution timeline
// ================================================================
export async function simulateGantt(ganttChart, speed = 750) {
  // Prevent overlapping simulations
  if (isSimulating) return;

  isSimulating = true;

  // DOM containers
  const container = document.getElementById("gantt-bar-container");
  const timeline = document.getElementById("gantt-timeline");

  // Clear previous simulation
  container.innerHTML = "";
  timeline.innerHTML = "";

  // Add idle segments for accurate visualization
  const chart = addIdleSegments(ganttChart);

  // ============================================================
  // PROCESS EACH GANTT SEGMENT
  // ============================================================
  for (let i = 0; i < chart.length; i++) {
    const item = chart[i];

    // ==========================================================
    // CREATE GANTT BLOCK
    // ==========================================================
    const block = document.createElement("div");

    block.classList.add("gantt-block");

    // ----------------------------------------------------------
    // Scale block width proportionally to execution duration
    // ----------------------------------------------------------
    block.style.flexGrow = item.duration;
    block.style.flexBasis = "0%";
    block.style.flexShrink = "1";

    // Display process ID
    block.textContent = item.id;

    // ==========================================================
    // APPLY BLOCK STYLING
    // ==========================================================
    if (item.id === "IDLE") {
      // CPU idle styling
      block.style.background = "#fafafa";
      block.style.color = "#777";
      block.style.fontStyle = "italic";
    } else {
      // Assign consistent process color
      block.style.background = getColor(item.id);
    }

    // Add block to chart container
    container.appendChild(block);

    // ==========================================================
    // CREATE TIMELINE LABEL
    // ==========================================================
    const span = document.createElement("span");

    // Display process start time
    span.textContent = item.start;

    // Match proportional scaling with block
    span.style.flexGrow = item.duration;
    span.style.flexBasis = "0%";
    span.style.flexShrink = "1";

    span.style.textAlign = "left";

    // Add label to timeline
    timeline.appendChild(span);

    // ==========================================================
    // ANIMATION DELAY
    // ==========================================================
    // Wait based on execution duration
    //
    // Longer processes appear longer on screen.
    // ----------------------------------------------------------
    await new Promise((resolve) => setTimeout(resolve, item.duration * speed));
  }

  // ============================================================
  // DISPLAY FINAL END TIME
  // ============================================================
  const end = document.createElement("span");

  end.textContent = chart[chart.length - 1].end;

  // Prevent flex distortion
  end.style.flex = "0 0 auto";

  timeline.appendChild(end);

  // ============================================================
  // RESET SIMULATION STATE
  // ============================================================
  isSimulating = false;
}
