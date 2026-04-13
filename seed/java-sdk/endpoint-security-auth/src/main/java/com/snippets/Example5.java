package com.snippets;

import com.seed.api.SeedApiClient;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .apiKey("<X-API-Key>")
                .build();

        client.user().getwithapikey();
    }
}
