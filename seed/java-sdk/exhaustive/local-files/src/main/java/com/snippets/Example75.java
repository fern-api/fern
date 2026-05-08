package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpoints.params.requests.GetWithPathAndQueryParamsRequest;

public class Example75 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().getWithPathAndQuery(
            GetWithPathAndQueryParamsRequest
                .builder()
                .param("param")
                .query("query")
                .build()
        );
    }
}