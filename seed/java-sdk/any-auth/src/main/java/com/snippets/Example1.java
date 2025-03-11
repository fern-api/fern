package com.snippets;

import com.seed.any.auth.SeedAnyAuthClient;

public class Example1 {
    public static void run() {
        SeedAnyAuthClient client = SeedAnyAuthClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.user().get();
    }
}