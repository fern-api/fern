package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.GetUserRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder().build();

        client.getUser("userId", GetUserRequest.builder().build());
    }
}
