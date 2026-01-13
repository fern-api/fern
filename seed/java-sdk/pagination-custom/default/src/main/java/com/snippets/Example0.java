package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListUsernamesRequestCustom;

public class Example0 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listUsernamesCustom(ListUsernamesRequestCustom.builder()
                        .startingAfter("starting_after")
                        .build());
    }
}
