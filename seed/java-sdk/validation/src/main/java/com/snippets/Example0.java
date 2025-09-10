package com.snippets;

import com.seed.validation.SeedValidationClient;
import com.seed.validation.requests.CreateRequest;
import com.seed.validation.types.Shape;

public class Example0 {
    public static void main(String[] args) {
        SeedValidationClient client = SeedValidationClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.create(
            CreateRequest
                .builder()
                .decimal(2.2)
                .even(100)
                .name("fern")
                .shape(Shape.SQUARE)
                .build()
        );
    }
}