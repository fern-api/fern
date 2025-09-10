package com.snippets;

import com.seed.builderExtension.SeedBuilderExtensionClient;

public class Example0 {
    public static void main(String[] args) {
        SeedBuilderExtensionClient client = SeedBuilderExtensionClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().hello();
    }
}