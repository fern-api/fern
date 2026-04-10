package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.types.object.types.ObjectWithMixedRequiredAndOptionalFields;

public class Example26 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().getAndReturnWithMixedRequiredAndOptionalFields(
            ObjectWithMixedRequiredAndOptionalFields
                .builder()
                .requiredString("hello")
                .requiredInteger(0)
                .requiredLong(0L)
                .optionalString("world")
                .build()
        );
    }
}