package com.snippets;

import com.seed.inferredAuthImplicit.SeedInferredAuthImplicitClient;

public class Example4 {
    public static void main(String[] args) {
        SeedInferredAuthImplicitClient client = SeedInferredAuthImplicitClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.simple().getSomething();
    }
}