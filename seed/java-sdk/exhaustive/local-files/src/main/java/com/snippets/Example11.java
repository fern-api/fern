package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.types.object.types.ObjectWithRequiredField;

public class Example11 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().httpMethods().testPost(
            ObjectWithRequiredField
                .builder()
                .string("string")
                .build()
        );
    }
}