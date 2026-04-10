package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesNestedObjectWithRequiredField;
import com.fern.sdk.types.TypesObjectWithOptionalField;
import com.fern.sdk.types.TypesObjectWithRequiredNestedObject;

public class Example50 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsObject().endpointsObjectGetAndReturnWithRequiredNestedObject(
            TypesObjectWithRequiredNestedObject
                .builder()
                .requiredString("requiredString")
                .requiredObject(
                    TypesNestedObjectWithRequiredField
                        .builder()
                        .string("string")
                        .nestedObject(
                            TypesObjectWithOptionalField
                                .builder()
                                .build()
                        )
                        .build()
                )
                .build()
        );
    }
}