package com.snippets;

import com.seed.auth.environment.variables.SeedAuthEnvironmentVariablesClient;

public class Example0 {
    public static void run() {
        SeedAuthEnvironmentVariablesClient client = SeedAuthEnvironmentVariablesClient
            .builder()
            .apiKey("<value>")
            .url("https://api.fern.com")
            .build();

        client.service().getWithApiKey();
    }
}