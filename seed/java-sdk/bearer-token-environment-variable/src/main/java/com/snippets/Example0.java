package com.snippets;

import com.seed.bearerTokenEnvironmentVariable.SeedBearerTokenEnvironmentVariableClient;

public class Example0 {
    public static void run() {
        SeedBearerTokenEnvironmentVariableClient client = SeedBearerTokenEnvironmentVariableClient
            .builder()
            .apiKey("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().getWithBearerToken();
    }
}