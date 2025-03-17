package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.endpoints.params.requests.GetWithQuery;

public class Example24 {
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