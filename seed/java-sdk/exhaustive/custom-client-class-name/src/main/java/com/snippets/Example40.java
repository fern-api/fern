package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointsobject.requests.EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest;
import com.seed.api.types.TypesNestedObjectWithRequiredField;
import com.seed.api.types.TypesObjectWithOptionalField;

public class Example40 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsObject()
                .endpointsObjectGetAndReturnNestedWithRequiredField(
                        EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest.builder()
                                .string("string")
                                .body(TypesNestedObjectWithRequiredField.builder()
                                        .string("string")
                                        .nestedObject(TypesObjectWithOptionalField.builder()
                                                .build())
                                        .build())
                                .build());
    }
}
