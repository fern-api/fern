package com.snippets;

import com.seed.inferredAuthImplicitApiKey.SeedInferredAuthImplicitApiKeyClient;

public class Example1 {
    public static void main(String[] args) {
        SeedInferredAuthImplicitApiKeyClient client = SeedInferredAuthImplicitApiKeyClient.builder()
                .url("https://api.fern.com")
                .build();

        client.nestedNoAuth().api().getSomething();
    }
}
