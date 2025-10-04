package com.snippets;

import com.seed.noEnvironment.SeedNoEnvironmentClient;

public class Example0 {
    public static void main(String[] args) {
        SeedNoEnvironmentClient client = SeedNoEnvironmentClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.dummy().getDummy();
    }
}
