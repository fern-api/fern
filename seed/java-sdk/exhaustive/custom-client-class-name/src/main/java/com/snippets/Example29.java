package com.snippets;

import com.seed.api.Best;
import com.seed.api.types.TypesObjectWithOptionalField;

public class Example29 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .contentType()
                .postJsonPatchContentWithCharsetType(
                        TypesObjectWithOptionalField.builder().build());
    }
}
