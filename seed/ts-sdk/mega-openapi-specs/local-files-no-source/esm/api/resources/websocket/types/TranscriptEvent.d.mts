export interface TranscriptEvent {
    type: TranscriptEvent.Type;
    data: string;
}
export declare namespace TranscriptEvent {
    const Type: {
        readonly Transcript: "transcript";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
