package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpoints.httpmethods.requests.TestPutHttpMethodsRequest;
import com.fern.sdk.types.TypesObjectWithRequiredField;

public class Example35 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().httpMethods().testPut(
            TestPutHttpMethodsRequest
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