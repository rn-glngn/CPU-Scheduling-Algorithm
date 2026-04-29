export function sjf(processes) {
  const n = processes.length;
  const completed = [];
  const ganttChart = [];
  const table = [];

  let currentTime = 0;
  let remaining = [...processes].map((p) => ({ ...p, done: false }));

  while (completed.length < n) {
    // get available processes (arrived + not done)
    const available = remaining.filter(
      (p) => !p.done && p.arrival <= currentTime,
    );

    if (available.length === 0) {
      currentTime++;
      continue;
    }

    // pick shortest burst time
    available.sort((a, b) => a.burst - b.burst);
    const current = available[0];

    const start = currentTime;
    const end = start + current.burst;

    const completion = end;
    const turnaround = completion - current.arrival;
    const waiting = turnaround - current.burst;

    ganttChart.push({
      id: current.id,
      start,
      end,
      duration: end - start,
    });

    table.push({
      id: current.id,
      arrival: current.arrival,
      burst: current.burst,
      priority: current.priority,
      completion,
      waiting,
      turnaround,
    });

    currentTime = end;
    current.done = true;
    completed.push(current);
  }

  const avgWaiting = table.reduce((sum, p) => sum + p.waiting, 0) / n;

  const avgTurnaround = table.reduce((sum, p) => sum + p.turnaround, 0) / n;

  return {
    ganttChart,
    table,
    averages: {
      waiting: avgWaiting,
      turnaround: avgTurnaround,
    },
  };
}
