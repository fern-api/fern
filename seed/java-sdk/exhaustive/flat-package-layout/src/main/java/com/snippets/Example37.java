package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.endpoints.types.TestDeleteHttpMethodsRequest;

public class Example37 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .httpMethods()
                .testDelete("id", TestDeleteHttpMethodsRequest.builder().build());
    }
}
