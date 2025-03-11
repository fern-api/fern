package com.snippets;

import com.seed.response.property.SeedResponsePropertyClient;

public class Example3 {
    public static void run() {
        SeedResponsePropertyClient client = SeedResponsePropertyClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().getMovie("string");
    }
}