package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpoints.params.requests.GetWithQueryParamsRequest;

public class Example72 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().getWithQuery(
            GetWithQueryParamsRequest
                .builder()
                .query("query")
                .number(1)
                .build()
        );
    }
}