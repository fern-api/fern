package com.snippets;

import com.seed.validation.SeedValidationClient;
import com.seed.validation.requests.GetRequest;

public class Example1 {
    public static void run() {
        SeedValidationClient client = SeedValidationClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.get(
            GetRequest
                .builder()
                .decimal(2.2)
                .even(100)
                .name("foo")
                .build()
        );
    }
}