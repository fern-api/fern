package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.inlineusers.inlineusers.requests.ListUsersCursorPaginationRequest;
import com.seed.pagination.resources.inlineusers.inlineusers.types.Order;

public class Example5 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.inlineUsers().inlineUsers().listWithCursorPagination(
            ListUsersCursorPaginationRequest
                .builder()
                .page(1)
                .perPage(1)
                .order(Order.ASC)
                .startingAfter("starting_after")
                .build()
        );
    }
}