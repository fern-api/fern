package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.resources.endpoints.params.requests.GetWithPathAndQuery;

public class Example25 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().getWithPathAndQuery(
            "param",
            GetWithPathAndQuery
                .builder()
                .query("query")
                .build()
        );
    }
}