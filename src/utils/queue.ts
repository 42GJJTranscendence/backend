export class Queue<T> {
    private items: T[] = [];
  
    enqueue(element: T) {
      this.items.push(element);
    }
  
    dequeue(): T | undefined {
      return this.items.shift();
    }
  
    peek(): T | undefined {
      return this.items[0];
    }
  
    isEmpty(): boolean {
      return this.items.length === 0;
    }
  
    size(): number {
      return this.items.length;
    }
  
    contains(value: T): boolean {
      return this.items.includes(value);
    }

    remove(value: T): boolean {
      const index = this.items.indexOf(value);
      if (index !== -1) {
        this.items.splice(index, 1);
        return true;
      }
      return false;
    }
  }
  