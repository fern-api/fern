package com.snippets;

import com.seed.inferredAuthExplicit.SeedInferredAuthExplicitClient;

public class Example3 {
    public static void main(String[] args) {
        SeedInferredAuthExplicitClient client = SeedInferredAuthExplicitClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.nested().api().getSomething();
    }
}