package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.endpoints.types.TestPatchHttpMethodsRequest;
import com.seed.api.types.TypesObjectWithOptionalField;

public class Example39 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .httpMethods()
                .testPatch(
                        "id",
                        TestPatchHttpMethodsRequest.builder()
                                .body(TypesObjectWithOptionalField.builder().build())
                                .build());
    }
}
