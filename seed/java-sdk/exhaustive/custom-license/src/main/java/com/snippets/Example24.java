package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpointshttpmethods.requests.EndpointsHttpMethodsTestPutRequest;
import com.seed.api.types.TypesObjectWithRequiredField;

public class Example24 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsHttpMethods()
                .endpointsHttpMethodsTestPut(
                        "id",
                        EndpointsHttpMethodsTestPutRequest.builder()
                                .body(TypesObjectWithRequiredField.builder()
                                        .string("string")
                                        .build())
                                .build());
    }
}
