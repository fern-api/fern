package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.reqwithheaders.requests.GetWithCustomHeaderReqWithHeadersRequest;

public class Example9 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.reqWithHeaders().getWithCustomHeader(
            GetWithCustomHeaderReqWithHeadersRequest
                .builder()
                .testEndpointHeader("X-TEST-ENDPOINT-HEADER")
                .body("string")
                .build()
        );
    }
}