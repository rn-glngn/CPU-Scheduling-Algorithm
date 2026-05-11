// ======================================================================
// PRIORITY SCHEDULING ALGORITHMS
// ======================================================================
//
// INCLUDED ALGORITHMS:
// 1. Priority Non-Preemptive Scheduling
//    - Once a process starts executing, it continues until completion.
//    - CPU cannot interrupt the running process.
// 2. Priority Preemptive Scheduling
//    - CPU can interrupt the current process if a higher-priority
//      process arrives.
//    - Also known as Preemptive Priority Scheduling.
//
// PRIORITY RULE:
// Lower priority number = Higher priority
//    Priority 1 → Highest
//    Priority 5 → Lowest
//
// INPUT FORMAT:
// processes = [
//   { id: "P1", arrival: 0, burst: 5, priority: 2 }
//   { id: "P2", arrival: 0, burst: 3, priority: 1 }
// ]
//
// Each process contains:
// - id        : Process identifier
// - arrival   : Arrival time
// - burst     : CPU burst time
// - priority  : Process priority
//
// OUTPUT FORMAT:
// Returns an object containing:
// - ganttChart : Execution timeline data
// - table      : Computed scheduling metrics per process
// - averages   : Average waiting and turnaround times
// ======================================================================

// ======================================================================
// PRIORITY NON-PREEMPTIVE
// ======================================================================

export function priorityNonPreemptive(processes) {
  // Total number of processes
  const n = processes.length;

  // Current CPU time
  let time = 0;

  // Counter for completed processes
  let completed = 0;

  // ------------------------------------------------------------------
  // Clone processes and add completion tracking
  // ------------------------------------------------------------------
  const remaining = processes.map((p) => ({
    ...p,
    completed: false,
  }));

  // Stores execution order for Gantt Chart visualization
  const ganttChart = [];

  // Stores computed process metrics
  const tableMap = new Map();

  // ------------------------------------------------------------------
  // Initialize table data
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
  // MAIN SCHEDULING LOOP
  // Continues until all processes are completed
  // ------------------------------------------------------------------
  while (completed < n) {
    // Get all processes that already arrived and not yet completed
    const available = remaining.filter(
      (p) => p.arrival <= time && !p.completed,
    );

    // --------------------------------------------------------------
    // CPU IDLE CONDITION
    // --------------------------------------------------------------
    // If no process is available, CPU remains idle
    if (available.length === 0) {
      // Find next arriving process
      const nextArrival = Math.min(
        ...remaining.filter((p) => !p.completed).map((p) => p.arrival),
      );

      // Add idle segment to Gantt Chart
      ganttChart.push({
        id: "IDLE",
        start: time,
        end: nextArrival,
        duration: nextArrival - time,
      });

      // Move CPU time forward
      time = nextArrival;
      continue;
    }

    // --------------------------------------------------------------
    // Select highest-priority process
    // LOWER value = HIGHER priority
    // --------------------------------------------------------------
    available.sort((a, b) => {
      // If priorities are equal,
      // earlier arrival executes first
      if (a.priority === b.priority) {
        return a.arrival - b.arrival;
      }

      return a.priority - b.priority;
    });

    // Selected process
    const current = available[0];

    // --------------------------------------------------------------
    // Execute process completely
    // (NON-PREEMPTIVE)
    // --------------------------------------------------------------
    ganttChart.push({
      id: current.id,
      start: time,
      end: time + current.burst,
      duration: current.burst,
    });

    // Advance CPU time
    time += current.burst;

    // Mark process as completed
    current.completed = true;
    completed++;

    // --------------------------------------------------------------
    // Calculate scheduling metrics
    // --------------------------------------------------------------
    const p = tableMap.get(current.id);

    // Completion Time
    p.completion = time;

    // Turnaround Time = Completion - Arrival
    p.turnaround = p.completion - p.arrival;

    // Waiting Time = Turnaround - Burst
    p.waiting = p.turnaround - p.burst;
  }

  // Convert Map into array format
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
// PRIORITY PREEMPTIVE
// ======================================================================

export function priorityPreemptive(processes) {
  // Total number of processes
  const n = processes.length;

  // Current CPU time
  let time = 0;

  // Completed process counter
  let completed = 0;

  // ------------------------------------------------------------------
  // Clone processes and track remaining burst time
  // ------------------------------------------------------------------
  const remaining = processes.map((p) => ({
    ...p,
    remaining: p.burst,
    completed: false,
  }));

  // Stores execution segments
  const ganttChart = [];

  // Stores process metrics
  const tableMap = new Map();

  // ------------------------------------------------------------------
  // Initialize table
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

  // Tracks currently executing process
  let lastProcess = null;

  // Start time of current Gantt segment
  let segmentStart = 0;

  // ------------------------------------------------------------------
  // MAIN LOOP
  // Executes one time unit at a time
  // ------------------------------------------------------------------
  while (completed < n) {
    // Get all arrived and unfinished processes
    const available = remaining.filter(
      (p) => p.arrival <= time && !p.completed,
    );

    // --------------------------------------------------------------
    // CPU IDLE CONDITION
    // --------------------------------------------------------------
    if (available.length === 0) {
      // Save previous process segment
      if (lastProcess !== null) {
        ganttChart.push({
          id: lastProcess,
          start: segmentStart,
          end: time,
          duration: time - segmentStart,
        });

        lastProcess = null;
      }

      // Jump to next process arrival
      const nextArrival = Math.min(
        ...remaining.filter((p) => !p.completed).map((p) => p.arrival),
      );

      // Add idle segment
      ganttChart.push({
        id: "IDLE",
        start: time,
        end: nextArrival,
        duration: nextArrival - time,
      });

      time = nextArrival;
      continue;
    }

    // --------------------------------------------------------------
    // Select highest-priority process
    // --------------------------------------------------------------
    available.sort((a, b) => {
      // Tie breaker: earlier arrival first
      if (a.priority === b.priority) {
        return a.arrival - b.arrival;
      }

      return a.priority - b.priority;
    });

    const current = available[0];

    // --------------------------------------------------------------
    // PROCESS SWITCH / PREEMPTION
    // --------------------------------------------------------------
    // If CPU switches to another process,
    // save previous Gantt segment
    if (lastProcess !== current.id) {
      if (lastProcess !== null) {
        ganttChart.push({
          id: lastProcess,
          start: segmentStart,
          end: time,
          duration: time - segmentStart,
        });
      }

      // Start new segment
      lastProcess = current.id;
      segmentStart = time;
    }

    // --------------------------------------------------------------
    // Execute process for 1 time unit
    // --------------------------------------------------------------
    current.remaining--;
    time++;

    // --------------------------------------------------------------
    // Process Completion Check
    // --------------------------------------------------------------
    if (current.remaining === 0) {
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

  // ------------------------------------------------------------------
  // Save final running segment
  // ------------------------------------------------------------------
  if (lastProcess !== null) {
    ganttChart.push({
      id: lastProcess,
      start: segmentStart,
      end: time,
      duration: time - segmentStart,
    });
  }

  // Convert Map to array
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
