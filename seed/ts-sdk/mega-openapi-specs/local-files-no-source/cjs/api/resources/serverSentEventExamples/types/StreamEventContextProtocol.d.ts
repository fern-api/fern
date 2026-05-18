export type StreamEventContextProtocol = {
    event: "completion";
} | {
    event: "error";
} | {
    event: "event";
    name: string;
};
