package com.snippets;

import com.seed.singleUrlEnvironmentNoDefault.SeedSingleUrlEnvironmentNoDefaultClient;

public class Example0 {
    public static void run() {
        SeedSingleUrlEnvironmentNoDefaultClient client = SeedSingleUrlEnvironmentNoDefaultClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.dummy().getDummy();
    }
}