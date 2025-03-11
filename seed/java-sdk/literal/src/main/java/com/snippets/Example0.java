package com.snippets;

import com.seed.literal.SeedLiteralClient;
import com.seed.literal.resources.headers.requests.SendLiteralsInHeadersRequest;

public class Example0 {
    public static void run() {
        SeedLiteralClient client = SeedLiteralClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.headers().send(
            SendLiteralsInHeadersRequest
                .builder()
                .query("What is the weather today")
                .build()
        );
    }
}