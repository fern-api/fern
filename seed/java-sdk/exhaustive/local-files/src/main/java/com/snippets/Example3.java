package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.types.object.types.ObjectWithRequiredField;
import java.util.Arrays;
import java.util.HashSet;

public class Example3 {
    public static void run() {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().container().getAndReturnSetOfObjects(
            new HashSet<ObjectWithRequiredField>(
                Arrays.asList(
                    ObjectWithRequiredField
                        .builder()
                        .string("string")
                        .build()
                )
            )
        );
    }
}