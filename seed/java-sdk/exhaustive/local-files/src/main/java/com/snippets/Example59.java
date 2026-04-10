package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpointsparams.requests.EndpointsParamsModifyWithPathRequest;

public class Example59 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsParams().endpointsParamsModifyWithPath(
            EndpointsParamsModifyWithPathRequest
                .builder()
                .param("param")
                .body("string")
                .build()
        );
    }
}