package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpoints.params.requests.GetWithPathParamsRequest;

public class Example63 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().getWithPath(
            GetWithPathParamsRequest
                .builder()
                .param("param")
                .build()
        );
    }
}