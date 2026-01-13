package com.snippets;

import com.seed.anyAuth.SeedAnyAuthClient;

public class Example1 {
    public static void main(String[] args) {
        SeedAnyAuthClient client = SeedAnyAuthClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.user().get();
    }
}