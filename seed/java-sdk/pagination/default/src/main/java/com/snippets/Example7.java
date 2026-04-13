package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithBodyCursorPaginationRequest;
import com.seed.api.types.InlineUsersWithCursor;

public class Example7 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithBodyCursorPagination(
                        InlineUsersInlineUsersListWithBodyCursorPaginationRequest.builder()
                                .pagination(InlineUsersWithCursor.builder()
                                        .cursor("cursor")
                                        .build())
                                .build());
    }
}
