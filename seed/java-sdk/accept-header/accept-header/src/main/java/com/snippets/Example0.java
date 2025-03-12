package com.snippets;

import com.seed.accept.SeedAcceptClient;

public class Example0 {
    public static void run() {
        SeedAcceptClient client = SeedAcceptClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().endpoint();
    }
}