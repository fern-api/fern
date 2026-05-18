export interface RefundProcessedPayload {
    refundId: string;
    amount: number;
    reason?: (string | null) | undefined;
}
