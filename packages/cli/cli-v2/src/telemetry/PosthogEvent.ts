export interface PosthogEvent {
    event: string;
    properties?: Record<string, string | number | boolean>;
}
