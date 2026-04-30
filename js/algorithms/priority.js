export function priorityNonPreemptive(processes) {
  const n = processes.length;

  let time = 0;
  let completed = 0;

  const remaining = processes.map((p) => ({
    ...p,
    completed: false,
  }));

  const ganttChart = [];
  const tableMap = new Map();

  processes.forEach((p) => {
    tableMap.set(p.id, {
      id: p.id,
      arrival: p.arrival,
      burst: p.burst,
      priority: p.priority,
      completion: 0,
      waiting: 0,
      turnaround: 0,
    });
  });

  while (completed < n) {
    const available = remaining.filter(
      (p) => p.arrival <= time && !p.completed,
    );

    if (available.length === 0) {
      const nextArrival = Math.min(
        ...remaining.filter((p) => !p.completed).map((p) => p.arrival),
      );

      ganttChart.push({
        id: "IDLE",
        start: time,
        end: nextArrival,
        duration: nextArrival - time,
      });

      time = nextArrival;
      continue;
    }

    // pick highest priority (LOWER value = higher priority)
    available.sort((a, b) => {
      if (a.priority === b.priority) {
        return a.arrival - b.arrival;
      }
      return a.priority - b.priority;
    });

    const current = available[0];

    ganttChart.push({
      id: current.id,
      start: time,
      end: time + current.burst,
      duration: current.burst,
    });

    time += current.burst;
    current.completed = true;
    completed++;

    const p = tableMap.get(current.id);
    p.completion = time;
    p.turnaround = p.completion - p.arrival;
    p.waiting = p.turnaround - p.burst;
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

export function priorityPreemptive(processes) {
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
      priority: p.priority,
      completion: 0,
      waiting: 0,
      turnaround: 0,
    });
  });

  let lastProcess = null;
  let segmentStart = 0;

  while (completed < n) {
    const available = remaining.filter(
      (p) => p.arrival <= time && !p.completed,
    );

    if (available.length === 0) {
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
        ...remaining.filter((p) => !p.completed).map((p) => p.arrival),
      );

      ganttChart.push({
        id: "IDLE",
        start: time,
        end: nextArrival,
        duration: nextArrival - time,
      });

      time = nextArrival;
      continue;
    }

    // pick highest priority
    available.sort((a, b) => {
      if (a.priority === b.priority) {
        return a.arrival - b.arrival;
      }
      return a.priority - b.priority;
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
