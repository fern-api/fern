/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as SeedPagination from "../../../../api/index";
import * as core from "../../../../core";
import { Conversation } from "./Conversation";
import { CursorPages } from "./CursorPages";

export const PaginatedConversationResponse: core.serialization.ObjectSchema<
    serializers.PaginatedConversationResponse.Raw,
    SeedPagination.PaginatedConversationResponse
> = core.serialization.object({
    conversations: core.serialization.list(Conversation),
    pages: CursorPages.optional(),
    totalCount: core.serialization.property("total_count", core.serialization.number()),
    type: core.serialization.stringLiteral("conversation.list"),
});

export declare namespace PaginatedConversationResponse {
    export interface Raw {
        conversations: Conversation.Raw[];
        pages?: CursorPages.Raw | null;
        total_count: number;
        type: "conversation.list";
    }
}
