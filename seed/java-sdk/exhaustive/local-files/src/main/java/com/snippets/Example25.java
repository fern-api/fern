package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.endpoints.params.requests.GetWithPathAndQuery;

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