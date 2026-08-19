package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.types.object.types.NestedObjectWithRequiredField;
import com.seed.exhaustive.resources.types.object.types.ObjectWithOptionalField;
import com.seed.exhaustive.resources.types.object.types.ObjectWithRequiredNestedObject;

public class Example28 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .object()
                .getAndReturnWithRequiredNestedObject(ObjectWithRequiredNestedObject.builder()
                        .requiredString("hello")
                        .requiredObject(NestedObjectWithRequiredField.builder()
                                .string("nested")
                                .nestedObject(ObjectWithOptionalField.builder().build())
                                .build())
                        .build());
    }
}
