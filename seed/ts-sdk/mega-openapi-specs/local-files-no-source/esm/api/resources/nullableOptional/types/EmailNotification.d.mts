export interface EmailNotification {
    emailAddress: string;
    subject: string;
    htmlContent?: (string | null) | undefined;
}
