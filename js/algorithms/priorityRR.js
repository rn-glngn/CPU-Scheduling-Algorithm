// ======================================================================
// PRIORITY + ROUND ROBIN SCHEDULING ALGORITHMS
// ======================================================================
//
// This algorithm combines:
// 1. Priority Scheduling
//    - Processes are grouped based on priority.
//    - Lower priority number = Higher priority.
// 2. Round Robin (RR)
//    - Processes within the same priority level are executed
//      using a fixed Time Quantum.
//
// INCLUDED ALGORITHMS:
// 1. priorityRRNonPreemptive()
//    - Higher-priority queues execute first.
//    - Once a queue starts executing, it continues using RR.
//    - Running process is NOT interrupted by higher-priority arrivals.
// 2. priorityRRPreemptive()
//    - Uses RR inside each priority queue.
//    - Running process CAN be interrupted if a higher-priority
//      process arrives.
//
// INPUT FORMAT:
// processes = [
//   { id: "P1", arrival: 0, burst: 5, priority: 1 }
//   { id: "P2", arrival: 0, burst: 3, priority: 2 }
// ]
//
// timeQuantum = 2
//
// OUTPUT FORMAT:
// Returns an object containing:
// - ganttChart : Execution timeline data
// - table      : Computed scheduling metrics per process
// - averages   : Average waiting and turnaround times
// ======================================================================

// ======================================================================
// PRIORITY ROUND ROBIN - NON PREEMPTIVE
// ======================================================================

export function priorityRRNonPreemptive(processes, timeQuantum) {
  // Total number of processes
  const n = processes.length;

  // Current CPU time
  let time = 0;

  // Number of completed processes
  let completed = 0;

  // ------------------------------------------------------------------
  // Normalize process list
  // Add remaining burst tracker
  // Sort by arrival time
  // ------------------------------------------------------------------
  const remaining = processes
    .map((p) => ({
      ...p,
      remaining: p.burst,
      completed: false,
    }))
    .sort((a, b) => a.arrival - b.arrival);

  // Stores execution timeline
  const ganttChart = [];

  // Stores process metrics
  const tableMap = new Map();

  // ------------------------------------------------------------------
  // Initialize process table
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // Queue structure:
  // priority number → array of processes
  //
  // Example:
  // queues = {
  //   1: [P1, P2],
  //   2: [P3]
  // }
  // ------------------------------------------------------------------
  const queues = new Map();

  // Tracks next arriving process index
  let i = 0;

  // ------------------------------------------------------------------
  // Helper function:
  // Adds idle time into Gantt Chart
  // ------------------------------------------------------------------
  function pushIdle(start, end) {
    if (end <= start) return;

    const last = ganttChart[ganttChart.length - 1];

    // Merge consecutive idle blocks
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

  // ------------------------------------------------------------------
  // MAIN SCHEDULING LOOP
  // ------------------------------------------------------------------
  while (completed < n) {
    // --------------------------------------------------------------
    // Add newly arrived processes to their priority queue
    // --------------------------------------------------------------
    while (i < n && remaining[i].arrival <= time) {
      const p = remaining[i];

      // Create queue if not existing
      if (!queues.has(p.priority)) {
        queues.set(p.priority, []);
      }

      // Add process into its priority queue
      queues.get(p.priority).push(p);

      i++;
    }

    // --------------------------------------------------------------
    // Find highest-priority queue with available processes
    // --------------------------------------------------------------
    const available = [...queues.keys()]
      .filter((k) => queues.get(k).length > 0)
      .sort((a, b) => a - b); // lower number = higher priority

    // --------------------------------------------------------------
    // CPU IDLE CONDITION
    // --------------------------------------------------------------
    if (available.length === 0) {
      const nextArrival = i < n ? remaining[i].arrival : undefined;

      if (nextArrival === undefined) break;

      if (nextArrival > time) {
        pushIdle(time, nextArrival);
        time = nextArrival;
      }

      continue;
    }

    // Highest priority queue
    const priority = available[0];

    const queue = queues.get(priority);

    // Select next process using RR
    const current = queue.shift();

    const startTime = time;

    // --------------------------------------------------------------
    // ROUND ROBIN EXECUTION
    // Execute up to timeQuantum
    // --------------------------------------------------------------
    let execTime = 0;

    while (execTime < timeQuantum && current.remaining > 0) {
      current.remaining--;
      time++;
      execTime++;

      // ----------------------------------------------------------
      // Add newly arrived processes during execution
      // ----------------------------------------------------------
      while (i < n && remaining[i].arrival <= time) {
        const p = remaining[i];

        if (!queues.has(p.priority)) {
          queues.set(p.priority, []);
        }

        queues.get(p.priority).push(p);

        i++;
      }
    }

    // --------------------------------------------------------------
    // Add execution segment to Gantt Chart
    // --------------------------------------------------------------
    ganttChart.push({
      id: current.id,
      start: startTime,
      end: time,
      duration: time - startTime,
    });

    // --------------------------------------------------------------
    // Requeue unfinished process
    // OR finalize completed process
    // --------------------------------------------------------------
    if (current.remaining > 0) {
      // Put back at end of queue
      queue.push(current);
    } else {
      current.completed = true;
      completed++;

      const p = tableMap.get(current.id);

      // Completion Time
      p.completion = time;

      // Turnaround Time
      p.turnaround = p.completion - p.arrival;

      // Waiting Time
      p.waiting = p.turnaround - p.burst;
    }
  }

  // Convert Map → Array
  const table = Array.from(tableMap.values());

  // ------------------------------------------------------------------
  // Compute averages
  // ------------------------------------------------------------------
  const avgWaiting = table.reduce((sum, p) => sum + p.waiting, 0) / n;

  const avgTurnaround = table.reduce((sum, p) => sum + p.turnaround, 0) / n;

  // ------------------------------------------------------------------
  // FINAL OUTPUT
  // ------------------------------------------------------------------
  return {
    ganttChart,
    table,
    averages: {
      waiting: avgWaiting,
      turnaround: avgTurnaround,
    },
  };
}

// ======================================================================
// PRIORITY ROUND ROBIN - PREEMPTIVE
// ======================================================================

export function priorityRRPreemptive(processes, timeQuantum) {
  // Total number of processes
  const n = processes.length;

  // Current CPU time
  let time = 0;

  // Completed process counter
  let completed = 0;

  // ------------------------------------------------------------------
  // Clone process list
  // Add remaining burst tracking
  // Sort by arrival
  // ------------------------------------------------------------------
  const remaining = processes
    .map((p) => ({
      ...p,
      remaining: p.burst,
      completed: false,
    }))
    .sort((a, b) => a.arrival - b.arrival);

  // Stores execution segments
  const ganttChart = [];

  // Stores scheduling metrics
  const tableMap = new Map();

  // ------------------------------------------------------------------
  // Initialize process table
  // ------------------------------------------------------------------
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

  // Priority queues
  const queues = new Map();

  // Arrival tracker
  let i = 0;

  // ------------------------------------------------------------------
  // Helper function:
  // Adds idle CPU segment
  // ------------------------------------------------------------------
  function pushIdle(start, end) {
    if (end <= start) return;

    const last = ganttChart[ganttChart.length - 1];

    // Merge consecutive idle blocks
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

  // ------------------------------------------------------------------
  // MAIN LOOP
  // ------------------------------------------------------------------
  while (completed < n) {
    // --------------------------------------------------------------
    // Add arriving processes
    // --------------------------------------------------------------
    while (i < n && remaining[i].arrival <= time) {
      const p = remaining[i];

      if (!queues.has(p.priority)) {
        queues.set(p.priority, []);
      }

      queues.get(p.priority).push(p);

      i++;
    }

    // --------------------------------------------------------------
    // Find highest-priority queue
    // --------------------------------------------------------------
    const available = [...queues.keys()]
      .filter((k) => queues.get(k).length > 0)
      .sort((a, b) => a - b);

    // --------------------------------------------------------------
    // CPU IDLE CONDITION
    // --------------------------------------------------------------
    if (available.length === 0) {
      const nextArrival = i < n ? remaining[i].arrival : undefined;

      if (nextArrival === undefined) break;

      if (nextArrival > time) {
        pushIdle(time, nextArrival);
        time = nextArrival;
      }

      continue;
    }

    // Current highest priority
    const priority = available[0];

    const queue = queues.get(priority);

    // Get next RR process
    const current = queue.shift();

    let startTime = time;

    let execTime = 0;

    // --------------------------------------------------------------
    // Execute process using Round Robin
    // --------------------------------------------------------------
    while (execTime < timeQuantum && current.remaining > 0) {
      current.remaining--;
      time++;
      execTime++;

      // ----------------------------------------------------------
      // Add newly arrived processes
      // ----------------------------------------------------------
      while (i < n && remaining[i].arrival <= time) {
        const p = remaining[i];

        if (!queues.has(p.priority)) {
          queues.set(p.priority, []);
        }

        queues.get(p.priority).push(p);

        i++;
      }

      // ----------------------------------------------------------
      // PREEMPTION CHECK
      // ----------------------------------------------------------
      // Interrupt current process if a higher-priority queue exists
      const higherExists = [...queues.keys()].some(
        (k) => k < priority && queues.get(k).length > 0,
      );

      if (higherExists) {
        // Stop execution immediately
        break;
      }
    }

    // --------------------------------------------------------------
    // Save execution segment
    // --------------------------------------------------------------
    ganttChart.push({
      id: current.id,
      start: startTime,
      end: time,
      duration: time - startTime,
    });

    // --------------------------------------------------------------
    // Requeue unfinished process
    // OR finalize completed process
    // --------------------------------------------------------------
    if (current.remaining > 0) {
      if (!queues.has(priority)) {
        queues.set(priority, []);
      }

      queues.get(priority).push(current);
    } else {
      current.completed = true;
      completed++;

      const p = tableMap.get(current.id);

      // Completion Time
      p.completion = time;

      // Turnaround Time
      p.turnaround = p.completion - p.arrival;

      // Waiting Time
      p.waiting = p.turnaround - p.burst;
    }
  }

  // Convert Map → Array
  const table = Array.from(tableMap.values());

  // ------------------------------------------------------------------
  // Compute averages
  // ------------------------------------------------------------------
  const avgWaiting = table.reduce((sum, p) => sum + p.waiting, 0) / n;

  const avgTurnaround = table.reduce((sum, p) => sum + p.turnaround, 0) / n;

  // ------------------------------------------------------------------
  // FINAL OUTPUT
  // ------------------------------------------------------------------
  return {
    ganttChart,
    table,
    averages: {
      waiting: avgWaiting,
      turnaround: avgTurnaround,
    },
  };
}
