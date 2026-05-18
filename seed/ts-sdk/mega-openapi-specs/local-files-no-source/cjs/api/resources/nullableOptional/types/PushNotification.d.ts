export interface PushNotification {
    deviceToken: string;
    title: string;
    body: string;
    badge?: (number | null) | undefined;
}
