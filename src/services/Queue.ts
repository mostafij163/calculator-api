import { singleton } from "tsyringe";

interface QueueItem {
  title: string;
  fileUri: string;
  equation: string;
}

@singleton()
export class Queue {
  items: QueueItem[] = [];

  enque(queueItem: QueueItem): QueueItem[] {

    this.items.push(queueItem);
    return this.items;
  }

  dequeue(): QueueItem {
    return this.items.shift();
  }

  isEmpty(): Boolean {
    if (this.items.length > 0) {
      return false;
    } else {
      return true;
    }
  }
}
