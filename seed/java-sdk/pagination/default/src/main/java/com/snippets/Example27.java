package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListWithGlobalConfigRequest;

public class Example27 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.users().listWithGlobalConfig(
            ListWithGlobalConfigRequest
                .builder()
                .offset(1)
                .build()
        );
    }
}