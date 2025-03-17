package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.types.object.types.ObjectWithRequiredField;
import java.util.HashMap;

public class Example5 {
    public static void run() {
        Best client = Best
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().container().getAndReturnMapOfPrimToObject(
            new HashMap<String, ObjectWithRequiredField>() {{
                put("string", ObjectWithRequiredField
                    .builder()
                    .string("string")
                    .build());
            }}
        );
    }
}