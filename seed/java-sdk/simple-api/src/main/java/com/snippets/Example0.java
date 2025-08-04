package com.snippets;

import com.seed.simpleApi.SeedSimpleApiClient;

public class Example0 {
    public static void main(String[] args) {
        SeedSimpleApiClient client = SeedSimpleApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.user().get("id");
    }
}