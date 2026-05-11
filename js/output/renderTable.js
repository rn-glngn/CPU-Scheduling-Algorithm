// ======================================================================
// RESULT TABLE RENDERING MODULE
// ======================================================================
//
// This module displays the computed scheduling results inside the
// Process Scheduling Table section of the application.
//
// It dynamically generates table rows based on the selected
// scheduling algorithm's output.
//
// ======================================================================

// ================================================================
// RENDER RESULT TABLE
// ================================================================
// Displays:
// • Process information
// • Completion Time
// • Waiting Time
// • Turnaround Time
// • Average metrics
//
// INPUT FORMAT:
// results = {
//   table: [...],
//   averages: {
//     waiting,
//     turnaround
//   }
// }
// ================================================================
export function renderTable(results) {
  // Reference to result table body
  const tbody = document.querySelector("#result-table tbody");

  // ------------------------------------------------------------
  // Clear previously rendered results
  // ------------------------------------------------------------
  tbody.innerHTML = "";

  // ============================================================
  // RENDER PROCESS ROWS
  // ============================================================
  results.table.forEach((p) => {
    // Create new row for each process
    const row = document.createElement("tr");

    // ----------------------------------------------------------
    // Populate process scheduling data
    // ----------------------------------------------------------
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.arrival}</td>
      <td>${p.burst}</td>

      <!-- Show priority value if available -->
      <td>${p.priority ?? "-"}</td>

      <td>${p.completion}</td>
      <td>${p.waiting}</td>
      <td>${p.turnaround}</td>
    `;

    // Add row to table
    tbody.appendChild(row);
  });

  // ============================================================
  // RENDER AVERAGE METRICS ROW
  // ============================================================
  // Displays:
  // • Average Waiting Time
  // • Average Turnaround Time
  // ============================================================
  const metricsRow = document.createElement("tr");

  metricsRow.id = "metrics";

  metricsRow.innerHTML = `
    <td colspan="5">Average</td>

    <!-- Average Waiting Time -->
    <td>${results.averages.waiting.toFixed(2)}</td>

    <!-- Average Turnaround Time -->
    <td>${results.averages.turnaround.toFixed(2)}</td>
  `;

  // Append metrics row to table
  tbody.appendChild(metricsRow);
}
