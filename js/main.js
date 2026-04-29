import { getInput, getTimeQuantum } from "./inputs/getInput.js";
import { validateInput } from "./inputs/validateInput.js";

// Show/hide Time Quantum input based on selected algorithm
const algoSelect = document.getElementById("sched-algo");
const tqContainer = document.getElementById("time-quantum-container");
const prioColElems = document.querySelectorAll(".prio-col");

algoSelect.addEventListener("change", () => {
  const selected = algoSelect.value;

  if (selected === "rr" || selected === "priority-rr") {
    tqContainer.style.display = "block";
  } else {
    tqContainer.style.display = "none";
  }

  if (selected.includes("priority")) {
    prioColElems.forEach((elem) => elem.classList.remove("hide-col"));
  } else {
    prioColElems.forEach((elem) => elem.classList.add("hide-col"));
  }
});

// Show the priority column only for Priority algorithms

// Main entry point - handles button click to process input data
document.getElementById("process-btn").addEventListener("click", () => {
  const algorithm = document.getElementById("sched-algo").value;
  const processes = getInput();

  if (!validateInput(processes)) return;

  let timeQuantum = null;

  if (algorithm === "rr" || algorithm === "priority-rr") {
    timeQuantum = getTimeQuantum();

    if (timeQuantum === null) return;
  }
});
