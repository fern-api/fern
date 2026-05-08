package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpoints.httpmethods.requests.TestGetHttpMethodsRequest;

public class Example34 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().httpMethods().testGet(
            TestGetHttpMethodsRequest
                .builder()
                .id("id")
                .build()
        );
    }
}