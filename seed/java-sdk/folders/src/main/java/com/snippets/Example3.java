package com.snippets;

import com.seed.api.SeedApiClient;

public class Example3 {
    public static void run() {
        SeedApiClient client = SeedApiClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.foo();
    }
}