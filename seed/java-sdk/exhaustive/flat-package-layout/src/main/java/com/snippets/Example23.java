package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.endpoints.types.GetWithQuery;

public class Example23 {
    public static void run() {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().getWithQuery(
            GetWithQuery
                .builder()
                .query("query")
                .number(1)
                .build()
        );
    }
}