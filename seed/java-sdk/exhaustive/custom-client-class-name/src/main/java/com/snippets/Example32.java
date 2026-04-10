package com.snippets;

import com.seed.api.Best;
import com.seed.api.types.TypesObjectWithOptionalField;

public class Example32 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsObject()
                .endpointsObjectGetAndReturnWithOptionalField(
                        TypesObjectWithOptionalField.builder().build());
    }
}
