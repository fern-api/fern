package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpointsobject.requests.EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest;
import com.fern.sdk.types.TypesNestedObjectWithRequiredField;
import com.fern.sdk.types.TypesObjectWithOptionalField;

public class Example40 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsObject().endpointsObjectGetAndReturnNestedWithRequiredField(
            EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest
                .builder()
                .string("string")
                .body(
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