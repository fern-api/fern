package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpointshttpmethods.requests.EndpointsHttpMethodsTestGetRequest;

public class Example23 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsHttpMethods().endpointsHttpMethodsTestGet(
            EndpointsHttpMethodsTestGetRequest
                .builder()
                .id("id")
                .build()
        );
    }
}