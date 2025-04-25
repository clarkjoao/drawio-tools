export type EventType = "cellAdded" | "cellRemoved" | "cellUpdated" | "modelChanged";

export interface MxEvent {
  type: EventType;
  data: any;
}

export type Listener = (event: MxEvent) => void;

export class MxEventEmitter {
  private listeners: Map<EventType, Listener[]> = new Map();

  on(eventType: EventType, listener: Listener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(listener);
  }

  off(eventType: EventType, listener: Listener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      this.listeners.set(
        eventType,
        listeners.filter((l) => l !== listener)
      );
    }
  }

  emit(eventType: EventType, data?: any): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach((listener) => listener({ type: eventType, data }));
    }
  }
}
