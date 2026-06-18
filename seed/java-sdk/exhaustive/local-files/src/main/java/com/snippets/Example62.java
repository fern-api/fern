package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.inlinedrequests.requests.PostWithArrayBodyAndHeaders;
import java.util.Arrays;

public class Example62 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.inlinedRequests().postWithArrayBodyAndHeaders(
            PostWithArrayBodyAndHeaders
                .builder()
                .body(
                    Arrays.asList("string", "string")
                )
                .xCustomHeader("X-Custom-Header")
                .build()
        );
    }
}