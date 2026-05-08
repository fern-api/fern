package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.GetWithCustomHeaderReqWithHeadersRequest;

public class Example9 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.reqWithHeaders()
                .getWithCustomHeader(GetWithCustomHeaderReqWithHeadersRequest.builder()
                        .testEndpointHeader("X-TEST-ENDPOINT-HEADER")
                        .body("string")
                        .build());
    }
}
