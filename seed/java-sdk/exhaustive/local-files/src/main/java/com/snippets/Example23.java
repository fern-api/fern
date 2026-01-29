package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.types.object.types.ObjectWithRequiredAndOptionalFields;

public class Example23 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().getAndReturnWithRequiredAndOptionalFields(
            ObjectWithRequiredAndOptionalFields
                .builder()
                .requiredString("<requiredString>")
                .optionalString("optional value")
                .build()
        );
    }
}