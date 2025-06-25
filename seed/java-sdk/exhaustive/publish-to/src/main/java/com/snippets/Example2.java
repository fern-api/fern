package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import java.util.Arrays;
import java.util.HashSet;

public class Example2 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().container().getAndReturnSetOfPrimitives(
            new HashSet<String>(
                Arrays.asList("string")
            )
        );
    }
}