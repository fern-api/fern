package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpoints.object.requests.GetAndReturnNestedWithRequiredFieldObjectRequest;
import com.seed.api.types.TypesNestedObjectWithRequiredField;
import com.seed.api.types.TypesObjectWithOptionalField;

public class Example51 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .object()
                .getAndReturnNestedWithRequiredField(GetAndReturnNestedWithRequiredFieldObjectRequest.builder()
                        .stringValue("string")
                        .body(TypesNestedObjectWithRequiredField.builder()
                                .string("string")
                                .nestedObject(
                                        TypesObjectWithOptionalField.builder().build())
                                .build())
                        .build());
    }
}
