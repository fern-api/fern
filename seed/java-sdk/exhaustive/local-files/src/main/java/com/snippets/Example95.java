package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpointsput.requests.EndpointsPutAddRequest;

public class Example95 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsPut().endpointsPutAdd(
            EndpointsPutAddRequest
                .builder()
                .id("id")
                .build()
        );
    }
}