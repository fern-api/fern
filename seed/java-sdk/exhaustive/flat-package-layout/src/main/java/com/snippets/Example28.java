package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.types.types.NestedObjectWithRequiredField;
import com.seed.exhaustive.types.types.ObjectWithOptionalField;
import com.seed.exhaustive.types.types.ObjectWithRequiredNestedObject;

public class Example28 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

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
