package com.snippets;

import com.seed.unions.SeedUnionsClient;

public class Example1 {
    public static void run() {
        SeedUnionsClient client = SeedUnionsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.union().update();
    }
}