package com.snippets;

import com.seed.examples.SeedExamplesClient;
import java.util.Optional;

public class Example19 {
    public static void main(String[] args) {
        SeedExamplesClient client = SeedExamplesClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().refreshToken(Optional.of());
    }
}