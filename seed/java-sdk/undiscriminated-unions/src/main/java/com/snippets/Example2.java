package com.snippets;

import com.seed.undiscriminatedUnions.SeedUndiscriminatedUnionsClient;

public class Example2 {
    public static void main(String[] args) {
        SeedUndiscriminatedUnionsClient client = SeedUndiscriminatedUnionsClient.builder()
                .url("https://api.fern.com")
                .build();

        client.union().getMetadata();
    }
}
