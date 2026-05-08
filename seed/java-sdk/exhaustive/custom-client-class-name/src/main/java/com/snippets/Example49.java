package com.snippets;

import com.seed.api.Best;
import com.seed.api.types.TypesNestedObjectWithOptionalField;

public class Example49 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .object()
                .getAndReturnNestedWithOptionalField(
                        TypesNestedObjectWithOptionalField.builder().build());
    }
}
