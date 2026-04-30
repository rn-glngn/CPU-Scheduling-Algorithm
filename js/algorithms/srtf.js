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
      // CLOSE current running segment FIRST
      if (lastProcess !== null) {
        ganttChart.push({
          id: lastProcess,
          start: segmentStart,
          end: time,
          duration: time - segmentStart,
        });

        lastProcess = null;
      }

      const nextArrival = Math.min(
        ...remaining
          .filter((p) => !p.completed && p.arrival > time)
          .map((p) => p.arrival),
      );

      // merge IDLE segments (avoid duplicates)
      const last = ganttChart[ganttChart.length - 1];

      if (last && last.id === "IDLE") {
        last.end = nextArrival;
        last.duration = last.end - last.start;
      } else {
        ganttChart.push({
          id: "IDLE",
          start: time,
          end: nextArrival,
          duration: nextArrival - time,
        });
      }

      time = nextArrival;
      continue;
    }

    available.sort((a, b) => {
      if (a.remaining === b.remaining) {
        return a.arrival - b.arrival;
      }
      return a.remaining - b.remaining;
    });
    const current = available[0];

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

    current.remaining--;
    time++;

    if (current.remaining === 0) {
      current.completed = true;
      completed++;

      const p = tableMap.get(current.id);
      p.completion = time;
      p.turnaround = p.completion - p.arrival;
      p.waiting = p.turnaround - p.burst;
    }
  }

  // push last gantt segment
  if (lastProcess !== null && segmentStart !== time) {
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
