export class MinPriorityQueue<T> {
  private heap: { element: T; priority: number }[] = [];

  constructor() {}

  enqueue(element: T, priority: number): void {
    this.heap.push({ element, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): { element: T; priority: number } | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number): void {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.heap[current].priority >= this.heap[parent].priority) break;
      
      const temp = this.heap[current];
      this.heap[current] = this.heap[parent];
      this.heap[parent] = temp;
      current = parent;
    }
  }

  private bubbleDown(index: number): void {
    let current = index;
    const length = this.heap.length;

    while (true) {
      const leftChild = 2 * current + 1;
      const rightChild = 2 * current + 2;
      let smallest = current;

      if (leftChild < length && this.heap[leftChild].priority < this.heap[smallest].priority) {
        smallest = leftChild;
      }
      if (rightChild < length && this.heap[rightChild].priority < this.heap[smallest].priority) {
        smallest = rightChild;
      }

      if (smallest === current) break;

      const temp = this.heap[current];
      this.heap[current] = this.heap[smallest];
      this.heap[smallest] = temp;
      current = smallest;
    }
  }
}
