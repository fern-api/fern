package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpoints.params.requests.ModifyWithInlinePathParamsRequest;

public class Example69 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().modifyWithInlinePath(
            ModifyWithInlinePathParamsRequest
                .builder()
                .param("param")
                .body("string")
                .build()
        );
    }
}