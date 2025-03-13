package com.snippets;

import com.seed.basicAuthEnvironmentVariables.SeedBasicAuthEnvironmentVariablesClient;

public class Example0 {
    public static void run() {
        SeedBasicAuthEnvironmentVariablesClient client = SeedBasicAuthEnvironmentVariablesClient
            .builder()
            .credentials("<username>", "<password>")
            .url("https://api.fern.com")
            .build();

        client.basicAuth().getWithBasicAuth();
    }
}