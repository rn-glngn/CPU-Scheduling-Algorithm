export function fcfs(processes) {
  // Sort by arrival time
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);

  let currentTime = 0;

  const ganttChart = [];
  const table = [];

  sorted.forEach((p) => {
    const start = Math.max(currentTime, p.arrival);
    const end = start + p.burst;

    const turnaround = end - p.arrival;
    const waiting = turnaround - p.burst;

    ganttChart.push({
      id: p.id,
      start,
      end,
      duration: end - start,
    });

    table.push({
      id: p.id,
      arrival: p.arrival,
      burst: p.burst,
      completion: end,
      turnaround,
      waiting,
    });

    currentTime = end;
  });

  const avgWaiting =
    table.reduce((sum, p) => sum + p.waiting, 0) / table.length;

  const avgTurnaround =
    table.reduce((sum, p) => sum + p.turnaround, 0) / table.length;

  return {
    ganttChart,
    table,
    averages: {
      waiting: avgWaiting,
      turnaround: avgTurnaround,
    },
  };
}
