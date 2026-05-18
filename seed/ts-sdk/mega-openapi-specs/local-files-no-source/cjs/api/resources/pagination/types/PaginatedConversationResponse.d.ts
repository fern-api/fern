import type * as SeedApi from "../../../index.js";
export interface PaginatedConversationResponse {
    conversations: SeedApi.pagination.Conversation[];
    pages?: (SeedApi.pagination.CursorPages | null) | undefined;
    total_count: number;
    type: PaginatedConversationResponse.Type;
}
export declare namespace PaginatedConversationResponse {
    const Type: {
        readonly ConversationList: "conversation.list";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
