package com.snippets;

import com.seed.authEnvironmentVariables.SeedAuthEnvironmentVariablesClient;

public class Example0 {
    public static void main(String[] args) {
        SeedAuthEnvironmentVariablesClient client = SeedAuthEnvironmentVariablesClient
            .builder()
            .apiKey("<value>")
            .url("https://api.fern.com")
            .build();

        client.service().getWithApiKey();
    }
}