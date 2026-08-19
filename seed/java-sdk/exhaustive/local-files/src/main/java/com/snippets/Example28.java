package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.types.object.types.NestedObjectWithRequiredField;
import com.fern.sdk.resources.types.object.types.ObjectWithOptionalField;
import com.fern.sdk.resources.types.object.types.ObjectWithRequiredNestedObject;

public class Example28 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().getAndReturnWithRequiredNestedObject(
            ObjectWithRequiredNestedObject
                .builder()
                .requiredString("hello")
                .requiredObject(
                    NestedObjectWithRequiredField
                        .builder()
                        .string("nested")
                        .nestedObject(
                            ObjectWithOptionalField
                                .builder()
                                .build()
                        )
                        .build()
                )
                .build()
        );
    }
}