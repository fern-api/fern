package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpoints.object.requests.GetAndReturnNestedWithRequiredFieldObjectRequest;
import com.fern.sdk.types.TypesNestedObjectWithRequiredField;
import com.fern.sdk.types.TypesObjectWithOptionalField;

public class Example51 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().getAndReturnNestedWithRequiredField(
            GetAndReturnNestedWithRequiredFieldObjectRequest
                .builder()
                .stringValue("string")
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