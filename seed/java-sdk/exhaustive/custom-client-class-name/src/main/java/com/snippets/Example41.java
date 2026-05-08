package com.snippets;

import com.seed.api.Best;
import com.seed.api.types.TypesObjectWithRequiredField;

public class Example41 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .httpMethods()
                .testPost(
                        TypesObjectWithRequiredField.builder().string("string").build());
    }
}
