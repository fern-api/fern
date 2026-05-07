package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.reqwithheaders.requests.GetwithcustomheaderReqwithheadersRequest;

public class Example10 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.reqwithheaders()
                .getwithcustomheader(GetwithcustomheaderReqwithheadersRequest.builder()
                        .testEndpointHeader("testEndpointHeader")
                        .body("string")
                        .build());
    }
}
