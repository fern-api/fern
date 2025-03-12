package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;

public class Example28 {
    public static void run() {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().modifyWithPath("param", "string");
    }
}