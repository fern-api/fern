package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpointshttpmethods.requests.EndpointsHttpMethodsTestPatchRequest;
import com.fern.sdk.types.TypesObjectWithOptionalField;

public class Example28 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsHttpMethods().endpointsHttpMethodsTestPatch(
            EndpointsHttpMethodsTestPatchRequest
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