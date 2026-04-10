package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpointshttpmethods.requests.EndpointsHttpMethodsTestDeleteRequest;

public class Example26 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsHttpMethods().endpointsHttpMethodsTestDelete(
            EndpointsHttpMethodsTestDeleteRequest
                .builder()
                .id("id")
                .build()
        );
    }
}