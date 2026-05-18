export interface OutboundCallConversationsResponse {
    /** Always null when dry_run is true. */
    conversation_id: unknown | null;
    /** Always true for this response. */
    dry_run: boolean;
}
