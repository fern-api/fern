package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpoints.httpmethods.requests.HttpMethodsTestPutHttpMethodsRequest;
import com.seed.api.types.TypesObjectWithRequiredField;

public class Example36 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .httpMethods()
                .httpMethodsTestPut(
                        "id",
                        HttpMethodsTestPutHttpMethodsRequest.builder()
                                .body(TypesObjectWithRequiredField.builder()
                                        .string("string")
                                        .build())
                                .build());
    }
}
