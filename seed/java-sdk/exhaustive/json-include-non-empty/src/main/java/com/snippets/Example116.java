package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.reqwithheaders.requests.ReqWithHeadersGetWithCustomHeaderRequest;

public class Example116 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.reqwithheaders()
                .getwithcustomheader(ReqWithHeadersGetWithCustomHeaderRequest.builder()
                        .testEndpointHeader("testEndpointHeader")
                        .body("string")
                        .build());
    }
}
