package com.snippets;

import com.seed.api.Best;
import com.seed.api.types.TypesObjectWithMixedRequiredAndOptionalFields;

public class Example48 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsObject()
                .endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields(
                        TypesObjectWithMixedRequiredAndOptionalFields.builder()
                                .requiredString("requiredString")
                                .requiredInteger(1)
                                .requiredLong(1000000L)
                                .build());
    }
}
