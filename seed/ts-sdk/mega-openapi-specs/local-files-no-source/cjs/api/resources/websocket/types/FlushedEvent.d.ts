export interface FlushedEvent {
    type: FlushedEvent.Type;
}
export declare namespace FlushedEvent {
    const Type: {
        readonly Flushed: "flushed";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
