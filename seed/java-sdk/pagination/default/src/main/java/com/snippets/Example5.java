package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithMixedTypeCursorPaginationRequest;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithMixedTypeCursorPagination(
                        InlineUsersInlineUsersListWithMixedTypeCursorPaginationRequest.builder()
                                .cursor("cursor")
                                .build());
    }
}
