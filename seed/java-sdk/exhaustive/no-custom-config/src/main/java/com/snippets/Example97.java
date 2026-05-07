package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpoints.put.requests.EndpointsPutAddPutRequest;

public class Example97 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .put()
                .endpointsPutAdd("id", EndpointsPutAddPutRequest.builder().build());
    }
}
