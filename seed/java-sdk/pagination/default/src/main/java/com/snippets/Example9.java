package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithOffsetPaginationRequest;
import com.seed.api.types.InlineUsersOrder;

public class Example9 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithOffsetPagination(
                        InlineUsersInlineUsersListWithOffsetPaginationRequest.builder()
                                .page(1)
                                .perPage(1)
                                .order(InlineUsersOrder.ASC)
                                .startingAfter("starting_after")
                                .build());
    }
}
