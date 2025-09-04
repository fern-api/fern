package com.snippets;

import com.seed.errors.SeedErrorsClient;
import com.seed.errors.resources.simple.types.FooRequest;

public class Example12 {
    public static void main(String[] args) {
        SeedErrorsClient client = SeedErrorsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.simple().fooWithExamples(
            FooRequest
                .builder()
                .bar("hello")
                .build()
        );
    }
}