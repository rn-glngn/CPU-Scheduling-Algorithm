export function srtf(processes) {
  const n = processes.length;

  let time = 0;
  let completed = 0;

  const remaining = processes.map((p) => ({
    ...p,
    remaining: p.burst,
    completed: false,
  }));

  const ganttChart = [];
  const tableMap = new Map();

  processes.forEach((p) => {
    tableMap.set(p.id, {
      id: p.id,
      arrival: p.arrival,
      burst: p.burst,
      completion: 0,
      waiting: 0,
      turnaround: 0,
    });
  });

  let lastProcess = null;
  let segmentStart = 0;

  while (completed < n) {
    const available = remaining.filter(
      (p) => p.arrival <= time && !p.completed && p.remaining > 0,
    );

    if (available.length === 0) {
      time++;
      continue;
    }

    // pick shortest remaining time
    available.sort((a, b) => a.remaining - b.remaining);
    const current = available[0];

    // track gantt merging (important for clean UI)
    if (lastProcess !== current.id) {
      if (lastProcess !== null) {
        ganttChart.push({
          id: lastProcess,
          start: segmentStart,
          end: time,
          duration: time - segmentStart,
        });
      }

      lastProcess = current.id;
      segmentStart = time;
    }

    // execute 1 unit
    current.remaining--;
    time++;

    // if finished
    if (current.remaining === 0) {
      current.completed = true;
      completed++;

      const finishTime = time;

      const p = tableMap.get(current.id);
      p.completion = finishTime;
      p.turnaround = p.completion - p.arrival;
      p.waiting = p.turnaround - p.burst;
    }
  }

  // push last gantt segment
  if (lastProcess !== null) {
    ganttChart.push({
      id: lastProcess,
      start: segmentStart,
      end: time,
      duration: time - segmentStart,
    });
  }

  const table = Array.from(tableMap.values());

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
