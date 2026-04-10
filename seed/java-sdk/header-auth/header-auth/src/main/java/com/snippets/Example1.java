package com.snippets;

import com.seed.api.SeedApiClient;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .apiKey("<value>")
                .url("https://api.fern.com")
                .build();

        client.service().getwithbearertoken();
    }
}
