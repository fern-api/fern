package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithBodyCursorPaginationRequest;

public class Example6 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithBodyCursorPagination(
                        InlineUsersInlineUsersListWithBodyCursorPaginationRequest.builder()
                                .build());
    }
}
