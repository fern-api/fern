package com.snippets;

import com.seed.undiscriminatedUnions.SeedUndiscriminatedUnionsClient;

public class Example2 {
    public static void run() {
        SeedUndiscriminatedUnionsClient client = SeedUndiscriminatedUnionsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.union().getMetadata();
    }
}