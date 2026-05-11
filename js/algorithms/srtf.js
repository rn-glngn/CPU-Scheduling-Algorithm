// ======================================================================
// SHORTEST REMAINING TIME FIRST (SRTF) SCHEDULING ALGORITHM
// ======================================================================
//
// Shortest Remaining Time First (SRTF) is the PREEMPTIVE version
// of the Shortest Job First (SJF) scheduling algorithm.
//
// The CPU always executes the process with the SMALLEST remaining
// burst time among all available processes.
//
// If a newly arrived process has a shorter remaining time than the
// currently running process, the CPU immediately interrupts
// (preempts) the current process.
//
// INPUT FORMAT:
// processes = [
//   { id: "P1", arrival: 0, burst: 5 }
//   { id: "P2", arrival: 0, burst: 2 }
// ]
//
// OUTPUT FORMAT:
// Returns an object containing:
// - ganttChart : Execution timeline data
// - table      : Computed scheduling metrics per process
// - averages   : Average waiting and turnaround times
// ======================================================================

export function srtf(processes) {
  // Total number of processes
  const n = processes.length;

  // Current CPU time
  let time = 0;

  // Number of completed processes
  let completed = 0;

  // ------------------------------------------------------------------
  // Clone processes and track remaining burst time
  // ------------------------------------------------------------------
  const remaining = processes.map((p) => ({
    ...p,

    // Remaining burst time
    remaining: p.burst,

    // Completion tracker
    completed: false,
  }));

  // Stores execution timeline
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
      completion: 0,
      waiting: 0,
      turnaround: 0,
    });
  });

  // Tracks currently running process
  let lastProcess = null;

  // Start time of current Gantt segment
  let segmentStart = 0;

  // ==================================================================
  // MAIN SCHEDULING LOOP
  // ==================================================================
  while (completed < n) {
    // --------------------------------------------------------------
    // Get all available processes
    // Conditions:
    // • Already arrived
    // • Not completed
    // • Still has remaining burst time
    // --------------------------------------------------------------
    const available = remaining.filter(
      (p) => p.arrival <= time && !p.completed && p.remaining > 0,
    );

    // --------------------------------------------------------------
    // CPU IDLE CONDITION
    // --------------------------------------------------------------
    if (available.length === 0) {
      // ----------------------------------------------------------
      // Close currently running segment before idling
      // ----------------------------------------------------------
      if (lastProcess !== null) {
        ganttChart.push({
          id: lastProcess,
          start: segmentStart,
          end: time,
          duration: time - segmentStart,
        });

        lastProcess = null;
      }

      // ----------------------------------------------------------
      // Find next arriving process
      // ----------------------------------------------------------
      const nextArrival = Math.min(
        ...remaining
          .filter((p) => !p.completed && p.arrival > time)
          .map((p) => p.arrival),
      );

      // ----------------------------------------------------------
      // Merge consecutive IDLE segments
      // ----------------------------------------------------------
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

      // Jump CPU time forward
      time = nextArrival;

      continue;
    }

    // --------------------------------------------------------------
    // Select process with SHORTEST remaining burst time
    // --------------------------------------------------------------
    available.sort((a, b) => {
      // Tie breaker:
      // Earlier arrival executes first
      if (a.remaining === b.remaining) {
        return a.arrival - b.arrival;
      }

      return a.remaining - b.remaining;
    });

    // Selected process
    const current = available[0];

    // --------------------------------------------------------------
    // PROCESS SWITCH / PREEMPTION
    // --------------------------------------------------------------
    // If current process changes,
    // save previous execution segment
    // --------------------------------------------------------------
    if (lastProcess !== current.id) {
      // Save previous segment
      if (lastProcess !== null) {
        ganttChart.push({
          id: lastProcess,
          start: segmentStart,
          end: time,
          duration: time - segmentStart,
        });
      }

      // Start new execution segment
      lastProcess = current.id;

      segmentStart = time;
    }

    // --------------------------------------------------------------
    // Execute process for 1 time unit
    // --------------------------------------------------------------
    current.remaining--;

    // Advance CPU time
    time++;

    // --------------------------------------------------------------
    // PROCESS COMPLETION CHECK
    // --------------------------------------------------------------
    if (current.remaining === 0) {
      current.completed = true;

      completed++;

      const p = tableMap.get(current.id);

      // Completion Time
      p.completion = time;

      // Turnaround Time
      // = Completion - Arrival
      p.turnaround = p.completion - p.arrival;

      // Waiting Time
      // = Turnaround - Burst
      p.waiting = p.turnaround - p.burst;
    }
  }

  // ------------------------------------------------------------------
  // Save final Gantt segment
  // ------------------------------------------------------------------
  if (lastProcess !== null && segmentStart !== time) {
    ganttChart.push({
      id: lastProcess,
      start: segmentStart,
      end: time,
      duration: time - segmentStart,
    });
  }

  // Convert Map → Array
  const table = Array.from(tableMap.values());

  // ------------------------------------------------------------------
  // Compute Average Waiting Time
  // ------------------------------------------------------------------
  const avgWaiting = table.reduce((sum, p) => sum + p.waiting, 0) / n;

  // ------------------------------------------------------------------
  // Compute Average Turnaround Time
  // ------------------------------------------------------------------
  const avgTurnaround = table.reduce((sum, p) => sum + p.turnaround, 0) / n;

  // ------------------------------------------------------------------
  // FINAL OUTPUT
  // ------------------------------------------------------------------
  return {
    // Gantt Chart visualization data
    ganttChart,

    // Scheduling metrics
    table,

    // Overall scheduling performance
    averages: {
      waiting: avgWaiting,
      turnaround: avgTurnaround,
    },
  };
}
