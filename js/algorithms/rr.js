// ======================================================================
// ROUND ROBIN (RR) SCHEDULING ALGORITHM
// ======================================================================
//
// If the process is not finished after its quantum expires,
// it is placed back at the end of the ready queue.
//
// This algorithm is commonly used in time-sharing systems
// because it provides fair CPU allocation.
//
// INPUT FORMAT:
// processes = [
//   { id: "P1", arrival: 0, burst: 5 }
//   { id: "P2", arrival: 0, burst: 2 }
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

export function rr(processes, timeQuantum) {
  // Total number of processes
  const n = processes.length;

  // Current CPU time
  let time = 0;

  // Number of completed processes
  let completed = 0;

  // ------------------------------------------------------------------
  // Clone processes and add remaining burst tracker
  // ------------------------------------------------------------------
  const remaining = processes.map((p) => ({
    ...p,

    // Remaining burst time
    remaining: p.burst,

    // Completion tracker
    completed: false,
  }));

  // Stores execution segments for Gantt Chart
  const ganttChart = [];

  // Stores computed scheduling metrics
  const tableMap = new Map();

  // ------------------------------------------------------------------
  // Initialize scheduling table
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

  // ------------------------------------------------------------------
  // Ready Queue
  // Processes waiting for CPU execution
  // ------------------------------------------------------------------
  const queue = [];

  // Tracks current running process in Gantt Chart
  let lastProcess = null;

  // Start time of current Gantt segment
  let segmentStart = 0;

  // ------------------------------------------------------------------
  // Sort processes based on arrival time
  // ------------------------------------------------------------------
  remaining.sort((a, b) => a.arrival - b.arrival);

  // Arrival pointer
  // Tracks next process to arrive
  let i = 0;

  // ==================================================================
  // MAIN SCHEDULING LOOP
  // ==================================================================
  while (completed < n) {
    // --------------------------------------------------------------
    // Add newly arrived processes into Ready Queue
    // --------------------------------------------------------------
    while (i < n && remaining[i].arrival <= time) {
      queue.push(remaining[i]);

      i++;
    }

    // --------------------------------------------------------------
    // CPU IDLE CONDITION
    // --------------------------------------------------------------
    // If no process exists in the ready queue,
    // CPU remains idle until next process arrives.
    // --------------------------------------------------------------
    if (queue.length === 0) {
      // Close currently running Gantt segment
      if (lastProcess !== null) {
        ganttChart.push({
          id: lastProcess,
          start: segmentStart,
          end: time,
          duration: time - segmentStart,
        });

        lastProcess = null;
      }

      // No remaining arriving processes
      if (i >= n) break;

      // Next process arrival time
      const nextArrival = remaining[i].arrival;

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

      // Move CPU time forward
      time = nextArrival;

      continue;
    }

    // --------------------------------------------------------------
    // Get next process from Ready Queue (FIFO)
    // --------------------------------------------------------------
    const current = queue.shift();

    // --------------------------------------------------------------
    // Start new Gantt segment if process changes
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

      // Start new process segment
      lastProcess = current.id;

      segmentStart = time;
    }

    // --------------------------------------------------------------
    // Determine execution duration
    // --------------------------------------------------------------
    // Execute either:
    // - remaining burst time
    // - OR time quantum
    //
    // whichever is smaller
    // --------------------------------------------------------------
    const execTime = Math.min(timeQuantum, current.remaining);

    // Reduce remaining burst time
    current.remaining -= execTime;

    // Advance CPU time
    time += execTime;

    // --------------------------------------------------------------
    // Add processes arriving during execution
    // --------------------------------------------------------------
    while (i < n && remaining[i].arrival <= time) {
      queue.push(remaining[i]);

      i++;
    }

    // --------------------------------------------------------------
    // PROCESS REQUEUE / COMPLETION
    // --------------------------------------------------------------

    // If process still needs CPU time,
    // place it back at end of queue
    if (current.remaining > 0) {
      queue.push(current);
    } else {
      // Process completed
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
  // Close final Gantt segment
  // ------------------------------------------------------------------
  if (lastProcess !== null) {
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

    // Process scheduling metrics
    table,

    // Overall scheduling performance
    averages: {
      waiting: avgWaiting,
      turnaround: avgTurnaround,
    },
  };
}
