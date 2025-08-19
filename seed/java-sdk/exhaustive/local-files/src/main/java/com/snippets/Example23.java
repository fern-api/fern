package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.types.object.types.ObjectWithOptionalField;

public class Example23 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().testIntegerOverflowEdgeCases(
            ObjectWithOptionalField
                .builder()
                .string("just-under-boundary")
                .integer(-2147483649)
                .double_(-2)
                .bool(true)
                .build()
        );
    }
}