package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.core.RequestOptions;
import com.seed.exhaustive.resources.reqwithheaders.requests.ReqWithHeaders;

public class Example50 {
    public static void main(String[] args) {
        Best client = Best
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.reqWithHeaders().getWithCustomHeader(
            ReqWithHeaders
                .builder()
                .body("string")
                .build(),
            RequestOptions.builder().addHeader("X-TEST-SERVICE-HEADER", "X-TEST-SERVICE-HEADER").addHeader("X-TEST-ENDPOINT-HEADER", "X-TEST-ENDPOINT-HEADER").build()
        );
    }
}