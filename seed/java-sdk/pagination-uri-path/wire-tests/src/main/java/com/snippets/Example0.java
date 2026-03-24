package com.snippets;

import com.seed.paginationUriPath.SeedPaginationUriPathClient;

public class Example0 {
    public static void main(String[] args) {
        SeedPaginationUriPathClient client = SeedPaginationUriPathClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users().listWithUriPagination();
    }
}
