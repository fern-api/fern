package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.types.object.types.ObjectWithRequiredAndOptionalFields;

public class Example23 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .object()
                .getAndReturnWithRequiredAndOptionalFields(ObjectWithRequiredAndOptionalFields.builder()
                        .optionalString("optional value")
                        .build());
    }
}
