export function rr(processes, timeQuantum) {
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

  const queue = [];
  let lastProcess = null;
  let segmentStart = 0;

  // sort by arrival initially
  remaining.sort((a, b) => a.arrival - b.arrival);

  let i = 0; // pointer for arrivals

  while (completed < n) {
    // add newly arrived processes
    while (i < n && remaining[i].arrival <= time) {
      queue.push(remaining[i]);
      i++;
    }

    // if queue empty → CPU idle
    if (queue.length === 0) {
      const nextArrival = remaining[i].arrival;

      ganttChart.push({
        id: "IDLE",
        start: time,
        end: nextArrival,
        duration: nextArrival - time,
      });

      time = nextArrival;
      continue;
    }

    const current = queue.shift();

    // start new segment if different process
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

    const execTime = Math.min(timeQuantum, current.remaining);

    current.remaining -= execTime;
    time += execTime;

    // add arrivals during execution
    while (i < n && remaining[i].arrival <= time) {
      queue.push(remaining[i]);
      i++;
    }

    // if not finished → requeue
    if (current.remaining > 0) {
      queue.push(current);
    } else {
      current.completed = true;
      completed++;

      const p = tableMap.get(current.id);
      p.completion = time;
      p.turnaround = p.completion - p.arrival;
      p.waiting = p.turnaround - p.burst;
    }
  }

  // close last segment
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
