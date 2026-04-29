import { getInput, getTimeQuantum } from "./inputs/getInput.js";
import { validateInput } from "./inputs/validateInput.js";

export function toggleInputField(algo) {
  const selected = algoSelect.value;
  const priorityCells = document.querySelectorAll(".prio-col");
  const show = algo.includes("priority");

  if (selected === "rr" || selected === "priority-rr") {
    tqContainer.style.display = "block";
  } else {
    tqContainer.style.display = "none";
  }

  priorityCells.forEach((cell) => {
    if (show) {
      cell.classList.remove("hide-col");
    } else {
      cell.classList.add("hide-col");
    }
  });
}

// Show/hide input controls based on selected algorithm
const algoSelect = document.getElementById("sched-algo");
const tqContainer = document.getElementById("time-quantum-container");
const prioColElems = document.querySelectorAll(".prio-col");

algoSelect.addEventListener("change", () => {
  const selected = algoSelect.value;

  toggleInputField(selected);
});

// Clear input table and reset to default state
const clearBtn = document.getElementById("clear-btn");
const tableBody = document.getElementById("table-body");
clearBtn.addEventListener("click", () => {
  const tq = document.getElementById("time-quantum-container");
  document.getElementById("time-quantum").value = "";

  tableBody.innerHTML = "";

  for (let i = 1; i <= 2; i++) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>P${i}</td>
      <td><input type="number" placeholder="0" min="0"></td>
      <td><input type="number" placeholder="1" min="1"></td>
      <td class="prio-col hide-col"><input type="number" placeholder="0" min="0"></td>
    `;

    tableBody.appendChild(row);
  }

  toggleInputField(algoSelect.value);

  clearOutputs();
});

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
