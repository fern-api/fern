package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;

public class Example27 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().getWithPath("param");
    }
}