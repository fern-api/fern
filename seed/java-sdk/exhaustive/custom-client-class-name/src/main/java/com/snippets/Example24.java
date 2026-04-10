package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointshttpmethods.requests.EndpointsHttpMethodsTestPutRequest;
import com.seed.api.types.TypesObjectWithRequiredField;

public class Example24 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsHttpMethods()
                .endpointsHttpMethodsTestPut(EndpointsHttpMethodsTestPutRequest.builder()
                        .id("id")
                        .body(TypesObjectWithRequiredField.builder()
                                .string("string")
                                .build())
                        .build());
    }
}
