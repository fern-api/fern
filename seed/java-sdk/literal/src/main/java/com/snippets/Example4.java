package com.snippets;

import com.seed.literal.SeedLiteralClient;

public class Example4 {
    public static void run() {
        SeedLiteralClient client = SeedLiteralClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.path().send("123");
    }
}