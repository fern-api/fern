package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithBodyOffsetPaginationRequest;
import com.seed.api.types.InlineUsersWithPage;

public class Example13 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithBodyOffsetPagination(
                        InlineUsersInlineUsersListWithBodyOffsetPaginationRequest.builder()
                                .pagination(
                                        InlineUsersWithPage.builder().page(1).build())
                                .build());
    }
}
