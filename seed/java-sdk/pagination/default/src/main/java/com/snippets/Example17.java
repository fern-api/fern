package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest;
import com.seed.api.types.InlineUsersOrder;

public class Example17 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithOffsetPaginationHasNextPage(
                        InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest.builder()
                                .page(1)
                                .limit(1)
                                .order(InlineUsersOrder.ASC)
                                .build());
    }
}
