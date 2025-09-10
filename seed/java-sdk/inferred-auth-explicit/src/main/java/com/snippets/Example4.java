package com.snippets;

import com.seed.inferredAuthExplicit.SeedInferredAuthExplicitClient;

public class Example4 {
    public static void main(String[] args) {
        SeedInferredAuthExplicitClient client = SeedInferredAuthExplicitClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.simple().getSomething();
    }
}