package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest;

public class Example10 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithDoubleOffsetPagination(
                        InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest.builder()
                                .build());
    }
}
