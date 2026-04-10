package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.ReqWithHeadersGetWithCustomHeaderRequest;

public class Example115 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.reqwithheaders()
                .getwithcustomheader(ReqWithHeadersGetWithCustomHeaderRequest.builder()
                        .testEndpointHeader("X-TEST-ENDPOINT-HEADER")
                        .body("string")
                        .build());
    }
}
