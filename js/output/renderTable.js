export function renderTable(results) {
  const tbody = document.querySelector("#result-table tbody");

  // clear old rows
  tbody.innerHTML = "";

  results.table.forEach((p) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.arrival}</td>
      <td>${p.burst}</td>
      <td>${p.priority ?? "-"}</td>
      <td>${p.completion}</td>
      <td>${p.waiting}</td>
      <td>${p.turnaround}</td>
    `;

    tbody.appendChild(row);
  });

  // append metrics row
  const metricsRow = document.createElement("tr");
  metricsRow.id = "metrics";

  metricsRow.innerHTML = `
    <td colspan="5">Average</td>
    <td>${results.averages.waiting.toFixed(2)}</td>
    <td>${results.averages.turnaround.toFixed(2)}</td>
  `;

  tbody.appendChild(metricsRow);
}
