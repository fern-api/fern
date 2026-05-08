package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesNestedObjectWithRequiredField;
import com.fern.sdk.types.TypesObjectWithOptionalField;
import java.util.Arrays;

public class Example53 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().getAndReturnNestedWithRequiredFieldAsList(
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