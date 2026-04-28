package com.snippets;

import com.seed.bearerTokenEnvironmentVariable.SeedBearerTokenEnvironmentVariableClient;

public class Example0 {
    public static void main(String[] args) {
        SeedBearerTokenEnvironmentVariableClient client = SeedBearerTokenEnvironmentVariableClient.builder()
                .apiKey("YOUR_API_KEY")
                .url("https://api.fern.com")
                .build();

        client.service().getWithBearerToken();
    }
}
