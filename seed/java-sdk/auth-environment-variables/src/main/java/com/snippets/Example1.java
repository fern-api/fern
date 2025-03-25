package com.snippets;

import com.seed.authEnvironmentVariables.SeedAuthEnvironmentVariablesClient;
import com.seed.authEnvironmentVariables.resources.service.requests.HeaderAuthRequest;

public class Example1 {
    public static void main(String[] args) {
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