package com.snippets;

import com.seed.api.Best;
import com.seed.api.types.TypesObjectWithRequiredField;

public class Example25 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .container()
                .getAndReturnOptional(
                        TypesObjectWithRequiredField.builder().string("string").build());
    }
}
