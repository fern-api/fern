package com.snippets;

import com.seed.undiscriminated.unions.SeedUndiscriminatedUnionsClient;
import com.seed.undiscriminated.unions.resources.union.types.MyUnion;

public class Example0 {
    public static void run() {
        SeedUndiscriminatedUnionsClient client = SeedUndiscriminatedUnionsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.union().get(
            MyUnion.of("string")
        );
    }
}