package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListUsersCursorPaginationRequest;

public class Example11 {
    public static void run() {
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