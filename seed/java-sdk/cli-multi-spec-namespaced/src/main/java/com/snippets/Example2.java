package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.v2.requests.ListUsersRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .apiKey("<X-Api-Key>")
                .build();

        client.v2().listUsers(ListUsersRequest.builder().build());
    }
}
