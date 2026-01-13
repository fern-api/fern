package com.snippets;

import com.seed.inferredAuthImplicitNoExpiry.SeedInferredAuthImplicitNoExpiryClient;

public class Example2 {
    public static void main(String[] args) {
        SeedInferredAuthImplicitNoExpiryClient client = SeedInferredAuthImplicitNoExpiryClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.nestedNoAuth().api().getSomething();
    }
}