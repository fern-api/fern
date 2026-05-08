package com.snippets;

import com.seed.api.Best;
import com.seed.api.types.TypesObjectWithRequiredField;
import java.util.Arrays;

public class Example13 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .container()
                .getAndReturnListOfObjects(Arrays.asList(
                        TypesObjectWithRequiredField.builder().string("string").build()));
    }
}
