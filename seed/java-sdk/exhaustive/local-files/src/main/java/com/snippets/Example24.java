package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpointshttpmethods.requests.EndpointsHttpMethodsTestPutRequest;
import com.fern.sdk.types.TypesObjectWithRequiredField;

public class Example24 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsHttpMethods().endpointsHttpMethodsTestPut(
            EndpointsHttpMethodsTestPutRequest
                .builder()
                .id("id")
                .body(
                    TypesObjectWithRequiredField
                        .builder()
                        .string("string")
                        .build()
                )
                .build()
        );
    }
}