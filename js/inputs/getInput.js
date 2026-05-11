// ======================================================================
// INPUT TABLE MANAGEMENT + DATA EXTRACTION
// ======================================================================
//
// This module handles:
// 1. Dynamic row addition/removal in the process input table
// 2. Parsing user input into process objects
// 3. Retrieving time quantum for Round Robin-based algorithms
//
// It acts as the "data collection layer" between the UI and scheduler
// algorithms.
//
// ======================================================================

// ================================================================
// DOM ELEMENT REFERENCES
// ================================================================
const tableBody = document.getElementById("table-body");
const addBtn = document.getElementById("add-row-btn");
const removeBtn = document.getElementById("remove-row-btn");

// ================================================================
// ADD NEW PROCESS ROW
// ================================================================
// Creates a new table row dynamically when "+" button is clicked.
// Each row represents a process with:
// - Process ID (P1, P2, ...)
// - Arrival Time input
// - Burst Time input
// - Priority input (hidden unless needed)
// ================================================================
addBtn.addEventListener("click", () => {
  // Determine next process number based on current row count
  const rowCount = tableBody.rows.length + 1;

  // Create new table row
  const row = document.createElement("tr");

  // Inject input fields into row
  row.innerHTML = `
    <td>P${rowCount}</td>
    <td><input type="number" placeholder="0" min="0"></td>
    <td><input type="number" placeholder="1" min="1"></td>
    <td class="prio-col hide-col">
      <input type="number" placeholder="0" min="0">
    </td>
  `;

  // ------------------------------------------------------------
  // Show priority column only if algorithm uses priority scheduling
  // ------------------------------------------------------------
  if (document.getElementById("sched-algo").value.includes("priority")) {
    row.querySelector(".prio-col").classList.remove("hide-col");
  }

  // Append row to table body
  tableBody.appendChild(row);
});

// ================================================================
// REMOVE LAST PROCESS ROW
// ================================================================
// Ensures at least 3 processes remain (P1–P3 default minimum)
removeBtn.addEventListener("click", () => {
  if (tableBody.rows.length > 3) {
    tableBody.deleteRow(-1);
  }
});

// ================================================================
// HELPER: INPUT NORMALIZATION
// ================================================================
// Converts empty input values into 0 to avoid NaN issues
function parseOrZero(value) {
  return value === "" ? 0 : parseInt(value);
}

// ================================================================
// EXTRACT PROCESS INPUT DATA
// ================================================================
// Reads table inputs and converts them into an array of objects
//
// OUTPUT FORMAT:
// [
//   { id: "P1", arrival: 0, burst: 5, priority: 2 }
// ]
// ================================================================
export function getInput() {
  const rows = document.querySelectorAll("#table-body tr");

  const processes = [];

  rows.forEach((row, index) => {
    const cols = row.querySelectorAll("td");

    // Extract raw input values
    const arrivalInput = cols[1].querySelector("input").value;
    const burstInput = cols[2].querySelector("input").value;
    const priorityInput = cols[3].querySelector("input").value;

    // Normalize values (empty → 0)
    const arrival = parseOrZero(arrivalInput);
    const burst = parseOrZero(burstInput);
    const priority = parseOrZero(priorityInput);

    // Build process object
    processes.push({
      id: `P${index + 1}`,
      arrival,
      burst,
      priority,
    });
  });

  return processes;
}

// ================================================================
// GET TIME QUANTUM (ROUND ROBIN)
// ================================================================
// Validates user input for time quantum
//
// RULE:
// - Must be a number
// - Must be > 0
// ================================================================
export function getTimeQuantum() {
  const tqInput = document.getElementById("time-quantum");

  const value = parseInt(tqInput.value);

  // Validation check
  if (isNaN(value) || value <= 0) {
    alert("Time Quantum must be greater than 0.");
    return null;
  }

  return value;
}
