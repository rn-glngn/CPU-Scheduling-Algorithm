// ======================================================================
// FIRST-COME FIRST-SERVED (FCFS) SCHEDULING ALGORITHMS
// ======================================================================
// Processes are executed in the order they arrive in the ready queue.
//
// INPUT FORMAT:
// processes = Array of process objects
// Example:
// [
//   { id: "P1", arrival: 0, burst: 2 },
//   { id: "P2", arrival: 1, burst: 4 }
// ]
//
// Each process contains:
// - id       : Process identifier
// - arrival  : Arrival time of the process
// - burst    : CPU burst time required by the process
//
// OUTPUT FORMAT:
// Returns an object containing:
// - ganttChart : Execution timeline data
// - table      : Computed scheduling metrics per process
// - averages   : Average waiting and turnaround times
// ======================================================================

export function fcfs(processes) {
  // ------------------------------------------------------------------
  // Sort processes based on arrival time
  // ------------------------------------------------------------------
  // FCFS executes processes in the exact order they arrive.
  // Earlier arrival time = higher execution priority.
  //
  // We create a copy using [...processes] to avoid modifying the original array.
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);

  // Tracks the current CPU time during simulation
  let currentTime = 0;

  // Stores execution segments for Gantt Chart visualization
  const ganttChart = [];

  // Stores computed scheduling data for each process
  const table = [];

  // ------------------------------------------------------------------
  // Process each task sequentially
  // ------------------------------------------------------------------
  sorted.forEach((p) => {
    // CPU starts either:
    // - when current process arrives
    // - OR when previous process finishes
    //
    // This also handles CPU idle time.
    const start = Math.max(currentTime, p.arrival);

    // Completion time of the process
    const end = start + p.burst;

    // Turnaround Time = Completion Time - Arrival Time
    const turnaround = end - p.arrival;

    // Waiting Time = Turnaround Time - Burst Time
    const waiting = turnaround - p.burst;

    // --------------------------------------------------------------
    // Store Gantt Chart information
    // --------------------------------------------------------------
    ganttChart.push({
      id: p.id, // Process ID
      start, // Start execution time
      end, // End execution time
      duration: end - start, // Total runtime
    });

    // --------------------------------------------------------------
    // Store scheduling metrics in result table
    // --------------------------------------------------------------
    table.push({
      id: p.id,
      arrival: p.arrival,
      burst: p.burst,
      completion: end,
      turnaround,
      waiting,
    });

    // Update CPU time for next process
    currentTime = end;
  });

  // ------------------------------------------------------------------
  // Compute average waiting time and average turnaround time
  // ------------------------------------------------------------------
  const avgWaiting =
    table.reduce((sum, p) => sum + p.waiting, 0) / table.length;

  const avgTurnaround =
    table.reduce((sum, p) => sum + p.turnaround, 0) / table.length;

  // ------------------------------------------------------------------
  // FINAL OUTPUT
  // ------------------------------------------------------------------
  return {
    // Used for visual Gantt Chart rendering
    ganttChart,

    // Contains all computed process metrics
    table,

    // Overall scheduling performance
    averages: {
      waiting: avgWaiting,
      turnaround: avgTurnaround,
    },
  };
}
