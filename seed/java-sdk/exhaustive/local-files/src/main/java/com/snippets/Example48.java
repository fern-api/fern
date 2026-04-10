package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesObjectWithMixedRequiredAndOptionalFields;

public class Example48 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsObject().endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields(
            TypesObjectWithMixedRequiredAndOptionalFields
                .builder()
                .requiredString("requiredString")
                .requiredInteger(1)
                .requiredLong(1000000L)
                .build()
        );
    }
}