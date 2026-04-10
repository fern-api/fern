package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesObjectWithRequiredField;

public class Example30 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsHttpMethods().endpointsHttpMethodsTestPost(
            TypesObjectWithRequiredField
                .builder()
                .string("string")
                .build()
        );
    }
}