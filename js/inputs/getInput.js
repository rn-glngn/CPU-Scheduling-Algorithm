// Handles adding and removing rows in the input table
const tableBody = document.getElementById("table-body");
const addBtn = document.getElementById("add-row-btn");
const removeBtn = document.getElementById("remove-row-btn");

addBtn.addEventListener("click", () => {
  const rowCount = tableBody.rows.length + 1;

  const row = document.createElement("tr");

  row.innerHTML = `
    <td>P${rowCount}</td>
    <td><input type="number" placeholder="0" min="0"></td>
    <td><input type="number" placeholder="1" min="1"></td>
    <td class="prio-col hide-col"><input type="number" placeholder="0" min="0"></td>
  `;

  if (document.getElementById("sched-algo").value.includes("priority")) {
    row.querySelector(".prio-col").classList.remove("hide-col");
  }

  tableBody.appendChild(row);
});

removeBtn.addEventListener("click", () => {
  if (tableBody.rows.length > 2) {
    tableBody.deleteRow(-1);
  }
});

// Extracts input data from the table and returns an array of process objects
function parseOrZero(value) {
  return value === "" ? 0 : parseInt(value);
}

export function getInput() {
  const rows = document.querySelectorAll("#table-body tr");
  const processes = [];

  rows.forEach((row, index) => {
    const cols = row.querySelectorAll("td");

    const arrivalInput = cols[1].querySelector("input").value;
    const burstInput = cols[2].querySelector("input").value;
    const priorityInput = cols[3].querySelector("input").value;

    const arrival = parseOrZero(arrivalInput);
    const burst = parseOrZero(burstInput);
    const priority = parseOrZero(priorityInput);

    processes.push({
      id: `P${index + 1}`,
      arrival,
      burst,
      priority,
    });
  });

  return processes;
}

export function getTimeQuantum() {
  const tqInput = document.getElementById("time-quantum");
  const value = parseInt(tqInput.value);

  if (isNaN(value) || value <= 0) {
    alert("Time Quantum must be greater than 0.");
    return null;
  }

  return value;
}
