package com.snippets;

import com.seed.singleUrlEnvironmentDefault.SeedSingleUrlEnvironmentDefaultClient;

public class Example0 {
    public static void main(String[] args) {
        SeedSingleUrlEnvironmentDefaultClient client = SeedSingleUrlEnvironmentDefaultClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.dummy().getDummy();
    }
}