package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.inlineusers.inlineusers.requests.ListUsersCursorPaginationRequest;

public class Example11 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlineUsers()
                .inlineUsers()
                .listWithCursorPagination(ListUsersCursorPaginationRequest.builder()
                        .startingAfter("starting_after")
                        .build());
    }
}
