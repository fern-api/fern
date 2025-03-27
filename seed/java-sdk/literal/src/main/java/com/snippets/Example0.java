package com.snippets;

import com.seed.literal.SeedLiteralClient;
import com.seed.literal.resources.headers.requests.SendLiteralsInHeadersRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedLiteralClient client = SeedLiteralClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.headers().send(
            SendLiteralsInHeadersRequest
                .builder()
                .endpointVersion("02-12-2024")
                .async(true)
                .query("What is the weather today")
                .build()
        );
    }
}