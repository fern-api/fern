package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;

public class Example37 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().primitive().getAndReturnBase64("SGVsbG8gd29ybGQh".getBytes());
    }
}