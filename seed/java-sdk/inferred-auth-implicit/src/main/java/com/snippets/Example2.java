package com.snippets;

import com.seed.inferredAuthImplicit.SeedInferredAuthImplicitClient;

public class Example2 {
    public static void main(String[] args) {
        SeedInferredAuthImplicitClient client = SeedInferredAuthImplicitClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.nestedNoAuth().api().getSomething();
    }
}