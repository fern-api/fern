package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.inlineusers.inlineusers.requests.ListUsersOffsetStepPaginationRequest;
import com.seed.pagination.resources.inlineusers.inlineusers.types.Order;

public class Example7 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.inlineUsers().inlineUsers().listWithOffsetStepPagination(
            ListUsersOffsetStepPaginationRequest
                .builder()
                .page(1)
                .limit(1)
                .order(Order.ASC)
                .build()
        );
    }
}