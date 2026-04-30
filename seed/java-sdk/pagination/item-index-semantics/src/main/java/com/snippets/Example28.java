package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListUsernamesWithOptionalResponseRequest;

public class Example28 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listUsernamesWithOptionalResponse(ListUsernamesWithOptionalResponseRequest.builder()
                        .startingAfter("starting_after")
                        .build());
    }
}
