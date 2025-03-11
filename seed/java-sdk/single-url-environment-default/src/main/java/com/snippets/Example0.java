package com.snippets;

import com.seed.single.url.environment.default.SeedSingleUrlEnvironmentDefaultClient;

public class Example0 {
    public static void run() {
        SeedSingleUrlEnvironmentDefaultClient client = SeedSingleUrlEnvironmentDefaultClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.dummy().getDummy();
    }
}