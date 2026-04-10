package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesObjectWithMixedRequiredAndOptionalFields;

public class Example49 {
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
                .optionalString("optionalString")
                .build()
        );
    }
}