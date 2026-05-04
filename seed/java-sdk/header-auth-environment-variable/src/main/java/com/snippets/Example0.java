package com.snippets;

import com.seed.headerTokenEnvironmentVariable.SeedHeaderTokenEnvironmentVariableClient;

public class Example0 {
    public static void main(String[] args) {
        SeedHeaderTokenEnvironmentVariableClient client = SeedHeaderTokenEnvironmentVariableClient.builder()
                .headerTokenAuth("YOUR_HEADER_VALUE")
                .url("https://api.fern.com")
                .build();

        client.service().getWithBearerToken();
    }
}
