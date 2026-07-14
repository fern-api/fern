package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.GetUserRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.getUser("userId", GetUserRequest.builder().build());
    }
}
