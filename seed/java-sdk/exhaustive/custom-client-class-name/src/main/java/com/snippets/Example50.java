package com.snippets;

import com.seed.api.Best;
import com.seed.api.types.TypesNestedObjectWithRequiredField;
import com.seed.api.types.TypesObjectWithOptionalField;
import com.seed.api.types.TypesObjectWithRequiredNestedObject;

public class Example50 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsObject()
                .endpointsObjectGetAndReturnWithRequiredNestedObject(TypesObjectWithRequiredNestedObject.builder()
                        .requiredString("requiredString")
                        .requiredObject(TypesNestedObjectWithRequiredField.builder()
                                .string("string")
                                .nestedObject(
                                        TypesObjectWithOptionalField.builder().build())
                                .build())
                        .build());
    }
}
