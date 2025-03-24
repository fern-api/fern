package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.types.object.types.ObjectWithRequiredField;
import java.util.ArrayList;
import java.util.Arrays;

public class Example1 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().container().getAndReturnListOfObjects(
            new ArrayList<ObjectWithRequiredField>(
                Arrays.asList(
                    ObjectWithRequiredField
                        .builder()
                        .string("string")
                        .build(),
                    ObjectWithRequiredField
                        .builder()
                        .string("string")
                        .build()
                )
            )
        );
    }
}