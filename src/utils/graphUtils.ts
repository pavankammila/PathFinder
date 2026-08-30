export function getNextNodeLabel(existingLabels: string[]): string {
  const labels = new Set(existingLabels);
  let index = 0;
  while (true) {
    let label = '';
    let num = index;
    do {
      label = String.fromCharCode(65 + (num % 26)) + label;
      num = Math.floor(num / 26) - 1;
    } while (num >= 0);
    
    if (!labels.has(label)) {
      return label;
    }
    index++;
  }
}
