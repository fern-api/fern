package com.snippets;

import com.fern.sdk.SeedApiClient;

public class Example105 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsUrLs().endpointsUrlsWithUnderscores();
    }
}