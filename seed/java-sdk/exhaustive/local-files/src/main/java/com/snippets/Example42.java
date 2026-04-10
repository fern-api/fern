package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesNestedObjectWithRequiredField;
import com.fern.sdk.types.TypesObjectWithOptionalField;
import java.util.Arrays;

public class Example42 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsObject().endpointsObjectGetAndReturnNestedWithRequiredFieldAsList(
            Arrays.asList(
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
        );
    }
}