// ======================================================================
// SHORTEST JOB FIRST (SJF) SCHEDULING ALGORITHM
// ======================================================================
//
// The CPU always selects the process with the SMALLEST burst time
// among all currently available processes.
//
// Once a process starts executing, it runs until completion.
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

export function sjf(processes) {
  // Total number of processes
  const n = processes.length;

  // Stores completed processes
  const completed = [];

  // Stores execution timeline for visualization
  const ganttChart = [];

  // Stores process scheduling metrics
  const table = [];

  // Current CPU time
  let currentTime = 0;

  // ------------------------------------------------------------------
  // Clone process list and add completion tracker
  // ------------------------------------------------------------------
  let remaining = [...processes].map((p) => ({
    ...p,

    // Indicates if process already finished
    done: false,
  }));

  // ==================================================================
  // MAIN SCHEDULING LOOP
  // Continues until all processes are completed
  // ==================================================================
  while (completed.length < n) {
    // --------------------------------------------------------------
    // Get all available processes
    // Conditions:
    // • Process already arrived
    // • Process not yet completed
    // --------------------------------------------------------------
    const available = remaining.filter(
      (p) => !p.done && p.arrival <= currentTime,
    );

    // --------------------------------------------------------------
    // CPU IDLE CONDITION
    // --------------------------------------------------------------
    // If no process has arrived yet,
    // advance CPU time by 1 unit.
    // --------------------------------------------------------------
    if (available.length === 0) {
      currentTime++;

      continue;
    }

    // --------------------------------------------------------------
    // Select process with shortest burst time
    // --------------------------------------------------------------
    available.sort((a, b) => a.burst - b.burst);

    // Chosen process
    const current = available[0];

    // --------------------------------------------------------------
    // Calculate execution times
    // --------------------------------------------------------------
    const start = currentTime;

    const end = start + current.burst;

    // Completion Time
    const completion = end;

    // Turnaround Time
    // = Completion - Arrival
    const turnaround = completion - current.arrival;

    // Waiting Time
    // = Turnaround - Burst
    const waiting = turnaround - current.burst;

    // --------------------------------------------------------------
    // Store execution segment in Gantt Chart
    // --------------------------------------------------------------
    ganttChart.push({
      id: current.id,
      start,
      end,
      duration: end - start,
    });

    // --------------------------------------------------------------
    // Store process metrics
    // --------------------------------------------------------------
    table.push({
      id: current.id,
      arrival: current.arrival,
      burst: current.burst,

      // Included for compatibility with other algorithms
      priority: current.priority,

      completion,
      waiting,
      turnaround,
    });

    // --------------------------------------------------------------
    // Update CPU state
    // --------------------------------------------------------------

    // Move CPU time forward
    currentTime = end;

    // Mark process as completed
    current.done = true;

    // Add to completed list
    completed.push(current);
  }

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
    // Used for Gantt Chart visualization
    ganttChart,

    // Scheduling metrics per process
    table,

    // Overall algorithm performance
    averages: {
      waiting: avgWaiting,
      turnaround: avgTurnaround,
    },
  };
}
