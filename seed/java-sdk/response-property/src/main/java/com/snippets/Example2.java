package com.snippets;

import com.seed.responseProperty.SeedResponsePropertyClient;

public class Example2 {
    public static void main(String[] args) {
        SeedResponsePropertyClient client = SeedResponsePropertyClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().getMovie("string");
    }
}