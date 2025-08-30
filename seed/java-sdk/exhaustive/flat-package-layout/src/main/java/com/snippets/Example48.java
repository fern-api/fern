package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.types.ReqWithHeaders;

public class Example48 {
    public static void main(String[] args) {
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