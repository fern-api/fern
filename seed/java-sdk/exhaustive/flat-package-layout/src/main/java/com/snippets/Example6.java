package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.types.types.ObjectWithRequiredField;
import java.util.Optional;

public class Example6 {
    public static void run() {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().container().getAndReturnOptional(
            Optional.of(
                ObjectWithRequiredField
                    .builder()
                    .string("string")
                    .build()
            )
        );
    }
}