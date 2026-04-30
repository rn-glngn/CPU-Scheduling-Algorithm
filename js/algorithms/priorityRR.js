export function priorityRRNonPreemptive(processes, timeQuantum) {
  const n = processes.length;

  let time = 0;
  let completed = 0;

  // normalize + sort by arrival
  const remaining = processes
    .map((p) => ({
      ...p,
      remaining: p.burst,
      completed: false,
    }))
    .sort((a, b) => a.arrival - b.arrival);

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

  // priority → queue
  const queues = new Map();

  let i = 0;

  function pushIdle(start, end) {
    if (end <= start) return;

    const last = ganttChart[ganttChart.length - 1];

    if (last && last.id === "IDLE") {
      last.end = end;
      last.duration = last.end - last.start;
      return;
    }

    ganttChart.push({
      id: "IDLE",
      start,
      end,
      duration: end - start,
    });
  }

  while (completed < n) {
    // add arrivals
    while (i < n && remaining[i].arrival <= time) {
      const p = remaining[i];

      if (!queues.has(p.priority)) {
        queues.set(p.priority, []);
      }

      queues.get(p.priority).push(p);
      i++;
    }

    // get highest priority queue
    const available = [...queues.keys()]
      .filter((k) => queues.get(k).length > 0)
      .sort((a, b) => a - b); // lower = higher priority

    if (available.length === 0) {
      const nextArrival = i < n ? remaining[i].arrival : undefined;
      if (nextArrival === undefined) break;

      if (nextArrival > time) {
        pushIdle(time, nextArrival);
        time = nextArrival;
      }

      continue;
    }

    const priority = available[0];
    const queue = queues.get(priority);
    const current = queue.shift();

    const startTime = time;

    // execute (RR)
    let execTime = 0;

    while (execTime < timeQuantum && current.remaining > 0) {
      current.remaining--;
      time++;
      execTime++;

      // arrivals during execution
      while (i < n && remaining[i].arrival <= time) {
        const p = remaining[i];

        if (!queues.has(p.priority)) {
          queues.set(p.priority, []);
        }

        queues.get(p.priority).push(p);
        i++;
      }
    }

    // push gantt segment
    ganttChart.push({
      id: current.id,
      start: startTime,
      end: time,
      duration: time - startTime,
    });

    // requeue or finish
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

export function priorityRRPreemptive(processes, timeQuantum) {
  const n = processes.length;

  let time = 0;
  let completed = 0;

  const remaining = processes
    .map((p) => ({
      ...p,
      remaining: p.burst,
      completed: false,
    }))
    .sort((a, b) => a.arrival - b.arrival);

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

  const queues = new Map(); // priority → queue
  let i = 0;

  function pushIdle(start, end) {
    if (end <= start) return;

    const last = ganttChart[ganttChart.length - 1];

    if (last && last.id === "IDLE") {
      last.end = end;
      last.duration = last.end - last.start;
      return;
    }

    ganttChart.push({
      id: "IDLE",
      start,
      end,
      duration: end - start,
    });
  }

  while (completed < n) {
    // add arrivals
    while (i < n && remaining[i].arrival <= time) {
      const p = remaining[i];

      if (!queues.has(p.priority)) {
        queues.set(p.priority, []);
      }

      queues.get(p.priority).push(p);
      i++;
    }

    // find highest priority
    const available = [...queues.keys()]
      .filter((k) => queues.get(k).length > 0)
      .sort((a, b) => a - b);

    if (available.length === 0) {
      const nextArrival = i < n ? remaining[i].arrival : undefined;
      if (nextArrival === undefined) break;

      if (nextArrival > time) {
        pushIdle(time, nextArrival);
        time = nextArrival;
      }
      continue;
    }

    const priority = available[0];
    const queue = queues.get(priority);
    const current = queue.shift();

    let startTime = time;
    let execTime = 0;

    while (execTime < timeQuantum && current.remaining > 0) {
      current.remaining--;
      time++;
      execTime++;

      // check new arrivals
      while (i < n && remaining[i].arrival <= time) {
        const p = remaining[i];

        if (!queues.has(p.priority)) {
          queues.set(p.priority, []);
        }

        queues.get(p.priority).push(p);
        i++;
      }

      // 🔥 PREEMPTION CHECK
      const higherExists = [...queues.keys()].some(
        (k) => k < priority && queues.get(k).length > 0,
      );

      if (higherExists) {
        break; // interrupt immediately
      }
    }

    // push gantt segment
    ganttChart.push({
      id: current.id,
      start: startTime,
      end: time,
      duration: time - startTime,
    });

    // requeue or finish
    if (current.remaining > 0) {
      if (!queues.has(priority)) {
        queues.set(priority, []);
      }
      queues.get(priority).push(current);
    } else {
      current.completed = true;
      completed++;

      const p = tableMap.get(current.id);
      p.completion = time;
      p.turnaround = p.completion - p.arrival;
      p.waiting = p.turnaround - p.burst;
    }
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
