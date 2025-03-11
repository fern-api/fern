package com.snippets;

import com.seed.undiscriminated.unions.SeedUndiscriminatedUnionsClient;

public class Example2 {
    public static void run() {
        SeedUndiscriminatedUnionsClient client = SeedUndiscriminatedUnionsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.union().getMetadata();
    }
}