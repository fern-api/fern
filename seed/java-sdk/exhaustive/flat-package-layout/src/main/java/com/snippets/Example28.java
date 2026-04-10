package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.EndpointsHttpMethodsTestPatchRequest;
import com.seed.api.types.TypesObjectWithOptionalField;

public class Example28 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsHttpMethods()
                .endpointsHttpMethodsTestPatch(
                        "id",
                        EndpointsHttpMethodsTestPatchRequest.builder()
                                .body(TypesObjectWithOptionalField.builder().build())
                                .build());
    }
}
