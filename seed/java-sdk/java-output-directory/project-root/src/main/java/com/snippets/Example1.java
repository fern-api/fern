package com.snippets;

import com.test.sdk.SeedApiClient;
import com.test.sdk.resources.service.requests.ServiceGetUserRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().getuser(
            "userId",
            ServiceGetUserRequest
                .builder()
                .build()
        );
    }
}