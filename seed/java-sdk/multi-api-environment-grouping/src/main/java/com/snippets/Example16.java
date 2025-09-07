package com.snippets;

import com.seed.api.SeedApiClient;

public class Example16 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .build();

        client.listRefunds();
    }
}