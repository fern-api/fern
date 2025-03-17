package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.types.types.ObjectWithRequiredField;
import java.util.HashMap;

public class Example5 {
    public static void run() {
        SeedExhaustiveClient client = SeedExhaustiveClient
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