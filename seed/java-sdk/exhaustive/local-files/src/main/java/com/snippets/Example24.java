package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.types.object.types.ObjectWithOptionalField;

public class Example24 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().testIntegerOverflowEdgeCases(
            ObjectWithOptionalField
                .builder()
                .string("large-positive")
                .integer(1000000000000)
                .double_(1000000000000)
                .bool(false)
                .build()
        );
    }
}