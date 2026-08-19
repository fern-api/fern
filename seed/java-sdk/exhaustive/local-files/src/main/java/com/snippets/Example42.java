package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.endpoints.params.requests.CreateWithBodyAndQuery;
import com.fern.sdk.resources.types.object.types.ObjectWithRequiredField;

public class Example42 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().createWithBodyAndQuery(
            CreateWithBodyAndQuery
                .builder()
                .body(
                    ObjectWithRequiredField
                        .builder()
                        .string("string")
                        .build()
                )
                .fields("_fields")
                .build()
        );
    }
}