package com.snippets;

import com.seed.basic.auth.environment.variables.SeedBasicAuthEnvironmentVariablesClient;

public class Example0 {
    public static void run() {
        SeedBasicAuthEnvironmentVariablesClient client = SeedBasicAuthEnvironmentVariablesClient
            .builder()
            .username("<username>")
            .accessToken("<password>")
            .url("https://api.fern.com")
            .build();

        client.basicAuth().getWithBasicAuth();
    }
}