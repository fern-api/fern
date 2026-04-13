package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.UpdateUserRequest;

public class Example14 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service().updateuser("userId", UpdateUserRequest.builder().build());
    }
}
