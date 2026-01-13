package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListUsersCursorPaginationRequest;

public class Example25 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.users().listWithCursorPagination(
            ListUsersCursorPaginationRequest
                .builder()
                .startingAfter("starting_after")
                .build()
        );
    }
}