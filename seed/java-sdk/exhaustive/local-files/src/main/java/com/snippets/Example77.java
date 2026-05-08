package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpoints.params.requests.GetWithInlinePathAndQueryParamsRequest;

public class Example77 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().getWithInlinePathAndQuery(
            GetWithInlinePathAndQueryParamsRequest
                .builder()
                .param("param")
                .query("query")
                .build()
        );
    }
}