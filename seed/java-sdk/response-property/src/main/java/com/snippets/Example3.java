package com.snippets;

import com.seed.responseProperty.SeedResponsePropertyClient;

public class Example3 {
    public static void run() {
        SeedResponsePropertyClient client = SeedResponsePropertyClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().getMovie("string");
    }
}