package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.resources.types.object.types.ObjectWithRequiredField;
import java.util.HashMap;

public class Example7 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .container()
                .getAndReturnMapOfIntegerToObject(new HashMap<Integer, ObjectWithRequiredField>() {
                    {
                        put(
                                1,
                                ObjectWithRequiredField.builder()
                                        .string("string")
                                        .build());
                    }
                });
    }
}
