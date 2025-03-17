package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListWithGlobalConfigRequest;

public class Example13 {
    public static void run() {
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