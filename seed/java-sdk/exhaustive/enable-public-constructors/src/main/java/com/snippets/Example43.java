package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.resources.reqwithheaders.requests.ReqWithHeaders;

public class Example43 {
    public static void run() {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.reqWithHeaders().getWithCustomHeader(
            ReqWithHeaders
                .builder()
                .xTestServiceHeader("X-TEST-SERVICE-HEADER")
                .xTestEndpointHeader("X-TEST-ENDPOINT-HEADER")
                .body("string")
                .build()
        );
    }
}