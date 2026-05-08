package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpoints.httpmethods.requests.TestPutHttpMethodsRequest;
import com.seed.api.types.TypesObjectWithRequiredField;

public class Example36 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .httpMethods()
                .testPut(TestPutHttpMethodsRequest.builder()
                        .id("id")
                        .body(TypesObjectWithRequiredField.builder()
                                .string("string")
                                .build())
                        .build());
    }
}
