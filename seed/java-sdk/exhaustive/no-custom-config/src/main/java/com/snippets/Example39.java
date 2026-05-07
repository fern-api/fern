package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpoints.httpmethods.requests.HttpMethodsTestPatchHttpMethodsRequest;
import com.seed.api.types.TypesObjectWithOptionalField;

public class Example39 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .httpMethods()
                .httpMethodsTestPatch(
                        "id",
                        HttpMethodsTestPatchHttpMethodsRequest.builder()
                                .body(TypesObjectWithOptionalField.builder().build())
                                .build());
    }
}
