package com.snippets;

import com.seed.headerTokenEnvironmentVariable.SeedHeaderTokenEnvironmentVariableClient;

public class Example0 {
    public static void main(String[] args) {
        SeedHeaderTokenEnvironmentVariableClient client = SeedHeaderTokenEnvironmentVariableClient.builder()
                .headerTokenAuth("<value>")
                .url("https://api.fern.com")
                .build();

        client.service().getWithBearerToken();
    }
}
