package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.inlineusers.inlineusers.requests.ListUsersOffsetPaginationRequest;
import com.seed.pagination.resources.inlineusers.inlineusers.types.Order;

public class Example4 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlineUsers()
                .inlineUsers()
                .listWithOffsetPagination(ListUsersOffsetPaginationRequest.builder()
                        .page(1)
                        .perPage(1)
                        .order(Order.ASC)
                        .startingAfter("starting_after")
                        .build());
    }
}
