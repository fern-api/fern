package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesNestedObjectWithOptionalField;

public class Example49 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().getAndReturnNestedWithOptionalField(
            TypesNestedObjectWithOptionalField
                .builder()
                .build()
        );
    }
}