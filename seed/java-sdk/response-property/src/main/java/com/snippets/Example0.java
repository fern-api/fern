package com.snippets;

import com.seed.responseProperty.SeedResponsePropertyClient;

public class Example0 {
    public static void run() {
        SeedResponsePropertyClient client = SeedResponsePropertyClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().getMovie("string");
    }
}