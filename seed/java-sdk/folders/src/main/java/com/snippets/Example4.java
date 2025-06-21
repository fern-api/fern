package com.snippets;

import com.seed.api.SeedApiClient;

public class Example4 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.folder().service().endpoint();
    }
}