package com.snippets;

import com.seed.javaOptionalQueryParamsOverloads.SeedJavaOptionalQueryParamsOverloadsClient;

public class Example2 {
    public static void main(String[] args) {
        SeedJavaOptionalQueryParamsOverloadsClient client = SeedJavaOptionalQueryParamsOverloadsClient.builder()
                .url("https://api.fern.com")
                .build();

        client.listAllPolicies();
    }
}
