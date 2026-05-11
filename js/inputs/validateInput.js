// ======================================================================
// INPUT VALIDATION MODULE
// ======================================================================
//
// This function ensures that all process inputs are valid before
// being passed into any CPU scheduling algorithm.
//
// It acts as a SAFETY CHECK layer to prevent:
// • Invalid burst times
// • Negative or zero execution values
// • Incorrect scheduling computation results
// ======================================================================

// ================================================================
// VALIDATE PROCESS INPUTS
// ================================================================
// Ensures that each process has a valid burst time (> 0)
//
// INPUT FORMAT:
// processes = [
//   { id, arrival, burst, priority }
// ]
//
// OUTPUT FORMAT:
// true  → if all inputs are valid
// false → if at least one invalid input is found
// ================================================================
export function validateInput(processes) {
  // Loop through all processes
  for (let p of processes) {
    // ------------------------------------------------------------
    // INVALID BURST TIME CHECK
    // ------------------------------------------------------------
    // Burst time represents CPU execution time.
    // It must be greater than 0 to be meaningful in scheduling.
    // ------------------------------------------------------------
    if (p.burst <= 0) {
      alert(`Process ${p.id}: Burst time must be greater than 0`);

      return false;
    }
  }

  // If all processes are valid, allow scheduling to proceed
  return true;
}
