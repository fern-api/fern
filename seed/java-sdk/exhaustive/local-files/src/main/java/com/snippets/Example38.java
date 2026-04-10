package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesNestedObjectWithOptionalField;

public class Example38 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsObject().endpointsObjectGetAndReturnNestedWithOptionalField(
            TypesNestedObjectWithOptionalField
                .builder()
                .build()
        );
    }
}