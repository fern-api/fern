package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.reqwithheaders.requests.ReqWithHeaders;

public class Example44 {
    public static void run() {
        Best client = Best
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