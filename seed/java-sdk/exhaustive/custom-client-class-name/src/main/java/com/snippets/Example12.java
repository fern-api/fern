package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.types.object.types.ObjectWithRequiredField;

public class Example12 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .httpMethods()
                .testPut(
                        "id", ObjectWithRequiredField.builder().string("string").build());
    }
}
