package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointshttpmethods.requests.EndpointsHttpMethodsTestPatchRequest;
import com.seed.api.types.TypesObjectWithOptionalField;

public class Example28 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsHttpMethods()
                .endpointsHttpMethodsTestPatch(EndpointsHttpMethodsTestPatchRequest.builder()
                        .id("id")
                        .body(TypesObjectWithOptionalField.builder().build())
                        .build());
    }
}
