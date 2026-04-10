package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpointshttpmethods.requests.EndpointsHttpMethodsTestGetRequest;

public class Example23 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsHttpMethods()
                .endpointsHttpMethodsTestGet(
                        EndpointsHttpMethodsTestGetRequest.builder().id("id").build());
    }
}
