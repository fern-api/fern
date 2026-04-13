package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.user.requests.UserGetRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.user().get("id", UserGetRequest.builder().build());
    }
}
