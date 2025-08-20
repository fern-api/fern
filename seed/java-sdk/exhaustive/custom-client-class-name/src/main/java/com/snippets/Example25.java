package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.types.object.types.ObjectWithOptionalField;

public class Example25 {
    public static void main(String[] args) {
        Best client = Best
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().testIntegerOverflowEdgeCases(
            ObjectWithOptionalField
                .builder()
                .string("large-negative")
                .integer(-1000000000000)
                .double_(-1000000000000)
                .bool(true)
                .build()
        );
    }
}