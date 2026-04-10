package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.auth.requests.AuthGetTokenRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.auth().gettoken(AuthGetTokenRequest.builder().apiKey("apiKey").build());
    }
}
