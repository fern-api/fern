export interface SmsNotification {
    phoneNumber: string;
    message: string;
    shortCode?: (string | null) | undefined;
}
