package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;

public class Example22 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().params().getWithPath("param");
    }
}
