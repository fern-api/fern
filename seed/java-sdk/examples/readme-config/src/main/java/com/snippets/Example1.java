package com.snippets;

import com.seed.examples.SeedExamplesClient;

public class Example1 {
    public static void main(String[] args) {
        SeedExamplesClient client = SeedExamplesClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.echo("string");
    }
}