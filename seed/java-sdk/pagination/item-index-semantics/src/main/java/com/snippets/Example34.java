package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListUsersAliasedDataRequest;

public class Example34 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listWithAliasedData(ListUsersAliasedDataRequest.builder()
                        .page(1)
                        .perPage(1)
                        .startingAfter("starting_after")
                        .build());
    }
}
