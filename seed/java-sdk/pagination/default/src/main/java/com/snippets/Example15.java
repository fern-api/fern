package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithOffsetStepPaginationRequest;
import com.seed.api.types.InlineUsersOrder;

public class Example15 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithOffsetStepPagination(
                        InlineUsersInlineUsersListWithOffsetStepPaginationRequest.builder()
                                .page(1)
                                .limit(1)
                                .order(InlineUsersOrder.ASC)
                                .build());
    }
}
