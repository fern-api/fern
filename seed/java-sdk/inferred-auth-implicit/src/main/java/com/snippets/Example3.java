package com.snippets;

import com.seed.inferredAuthImplicit.SeedInferredAuthImplicitClient;

public class Example3 {
    public static void main(String[] args) {
        SeedInferredAuthImplicitClient client = SeedInferredAuthImplicitClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.nested().api().getSomething();
    }
}