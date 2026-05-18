/**
 * Discriminated union for testing nullable unions
 */
export type NotificationMethod = {
    type: "email";
} | {
    type: "sms";
} | {
    type: "push";
};
