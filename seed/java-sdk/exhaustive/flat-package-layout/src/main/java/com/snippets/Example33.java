package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.endpoints.types.TestGetHttpMethodsRequest;

public class Example33 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .httpMethods()
                .testGet("id", TestGetHttpMethodsRequest.builder().build());
    }
}
