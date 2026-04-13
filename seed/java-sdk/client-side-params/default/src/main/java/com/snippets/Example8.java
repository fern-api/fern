package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.CreateUserRequest;

public class Example8 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .createuser(CreateUserRequest.builder()
                        .email("email")
                        .connection("connection")
                        .build());
    }
}
