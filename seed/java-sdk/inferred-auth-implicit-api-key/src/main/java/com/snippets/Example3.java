package com.snippets;

import com.seed.inferredAuthImplicitApiKey.SeedInferredAuthImplicitApiKeyClient;

public class Example3 {
    public static void main(String[] args) {
        SeedInferredAuthImplicitApiKeyClient client = SeedInferredAuthImplicitApiKeyClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.simple().getSomething();
    }
}