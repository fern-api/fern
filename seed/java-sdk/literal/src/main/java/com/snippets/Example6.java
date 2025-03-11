package com.snippets;

import com.seed.literal.SeedLiteralClient;
import com.seed.literal.resources.query.requests.SendLiteralsInQueryRequest;

public class Example6 {
    public static void run() {
        SeedLiteralClient client = SeedLiteralClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.query().send(
            SendLiteralsInQueryRequest
                .builder()
                .query("What is the weather today")
                .build()
        );
    }
}