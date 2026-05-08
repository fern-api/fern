package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpoints.httpmethods.requests.TestPatchHttpMethodsRequest;
import com.fern.sdk.types.TypesObjectWithOptionalField;

public class Example39 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().httpMethods().testPatch(
            TestPatchHttpMethodsRequest
                .builder()
                .id("id")
                .body(
                    TypesObjectWithOptionalField
                        .builder()
                        .build()
                )
                .build()
        );
    }
}