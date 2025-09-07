package com.snippets;

import com.seed.api.SeedApiClient;

public class Example7 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.listAccounts();
    }
}