package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListWithCustomPagerRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listWithCustomPager(ListWithCustomPagerRequest.builder()
                        .limit(1)
                        .startingAfter("starting_after")
                        .build());
    }
}
