package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpointsput.requests.EndpointsPutAddRequest;

public class Example94 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsPut()
                .endpointsPutAdd("id", EndpointsPutAddRequest.builder().build());
    }
}
