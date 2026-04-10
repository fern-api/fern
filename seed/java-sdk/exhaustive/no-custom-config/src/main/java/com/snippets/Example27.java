package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpointshttpmethods.requests.EndpointsHttpMethodsTestDeleteRequest;

public class Example27 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsHttpMethods()
                .endpointsHttpMethodsTestDelete(
                        "id", EndpointsHttpMethodsTestDeleteRequest.builder().build());
    }
}
