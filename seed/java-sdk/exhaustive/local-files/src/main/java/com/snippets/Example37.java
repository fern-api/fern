package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;

public class Example37 {
    public static void run() {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().primitive().getAndReturnBase64("SGVsbG8gd29ybGQh".getBytes());
    }
}