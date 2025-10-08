export class Event {
  public target: any;
  public type: string;
  constructor(type: string, target: any) {
    this.target = target;
    this.type = type;
  }
}

export class ErrorEvent extends Event {
  public message: string;
  public error: Error;
  constructor(error: Error, target: any) {
    super("error", target);
    this.message = error.message;
    this.error = error;
  }
}

export class CloseEvent extends Event {
  public code: number;
  public reason: string;
  public wasClean = true;
  constructor(code = 1000, reason = "", target: any) {
    super("close", target);
    this.code = code;
    this.reason = reason;
  }
}
export interface WebSocketEventMap {
  close: CloseEvent;
  error: ErrorEvent;
  message: MessageEvent;
  open: Event;
}

export interface WebSocketEventListenerMap {
  close: (
    event: CloseEvent,
  ) => undefined | { handleEvent: (event: CloseEvent) => void };
  error: (
    event: ErrorEvent,
  ) => undefined | { handleEvent: (event: ErrorEvent) => void };
  message: (
    event: MessageEvent,
  ) => undefined | { handleEvent: (event: MessageEvent) => void };
  open: (event: Event) => undefined | { handleEvent: (event: Event) => void };
}
