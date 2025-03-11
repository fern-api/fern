package com.snippets;

import com.seed.auth.environment.variables.SeedAuthEnvironmentVariablesClient;
import com.seed.auth.environment.variables.resources.service.requests.HeaderAuthRequest;

public class Example1 {
    public static void run() {
        SeedAuthEnvironmentVariablesClient client = SeedAuthEnvironmentVariablesClient
            .builder()
            .apiKey("<value>")
            .url("https://api.fern.com")
            .build();

        client.service().getWithHeader(
            HeaderAuthRequest
                .builder()
                .xEndpointHeader("X-Endpoint-Header")
                .build()
        );
    }
}