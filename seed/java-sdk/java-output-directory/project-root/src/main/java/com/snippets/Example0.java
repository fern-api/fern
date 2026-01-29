package com.snippets;

import com.test.sdk.SeedApiClient;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().getUser("userId");
    }
}