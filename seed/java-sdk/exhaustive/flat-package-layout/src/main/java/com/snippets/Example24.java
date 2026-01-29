package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.types.types.ObjectWithRequiredAndOptionalFields;

public class Example24 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .object()
                .getAndReturnWithRequiredAndOptionalFields(ObjectWithRequiredAndOptionalFields.builder()
                        .requiredString("requiredString")
                        .optionalString("optionalString")
                        .build());
    }
}
