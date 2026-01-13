package com.snippets;

import com.seed.inferredAuthImplicitNoExpiry.SeedInferredAuthImplicitNoExpiryClient;

public class Example4 {
    public static void main(String[] args) {
        SeedInferredAuthImplicitNoExpiryClient client = SeedInferredAuthImplicitNoExpiryClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.simple().getSomething();
    }
}