package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpoints.params.requests.GetWithInlinePathParamsRequest;

public class Example67 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().getWithInlinePath(
            GetWithInlinePathParamsRequest
                .builder()
                .param("param")
                .build()
        );
    }
}