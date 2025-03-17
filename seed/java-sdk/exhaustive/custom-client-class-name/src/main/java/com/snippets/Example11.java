package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.types.object.types.ObjectWithRequiredField;

public class Example11 {
    public static void run() {
        Best client = Best
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().httpMethods().testPost(
            ObjectWithRequiredField
                .builder()
                .string("string")
                .build()
        );
    }
}