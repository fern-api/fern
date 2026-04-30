package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.types.types.ObjectWithMixedRequiredAndOptionalFields;

public class Example27 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .object()
                .getAndReturnWithMixedRequiredAndOptionalFields(ObjectWithMixedRequiredAndOptionalFields.builder()
                        .requiredString("requiredString")
                        .requiredInteger(1)
                        .requiredLong(1000000L)
                        .optionalString("optionalString")
                        .build());
    }
}
