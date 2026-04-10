package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpointsparams.requests.EndpointsParamsModifyWithInlinePathRequest;

public class Example62 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsParams().endpointsParamsModifyWithInlinePath(
            EndpointsParamsModifyWithInlinePathRequest
                .builder()
                .param("param")
                .body("string")
                .build()
        );
    }
}