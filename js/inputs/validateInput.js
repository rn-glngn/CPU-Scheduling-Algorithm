export function validateInput(processes) {
  for (let p of processes) {
    if (p.burst <= 0) {
      alert(`Process ${p.id}: Burst time must be greater than 0`);
      return false;
    }
  }

  return true;
}
