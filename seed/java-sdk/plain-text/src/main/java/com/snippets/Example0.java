package com.snippets;

import com.seed.plain.text.SeedPlainTextClient;

public class Example0 {
    public static void run() {
        SeedPlainTextClient client = SeedPlainTextClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().getText();
    }
}