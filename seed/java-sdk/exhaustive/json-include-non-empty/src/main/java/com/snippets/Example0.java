package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import java.util.Arrays;

public class Example0 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().container().getAndReturnListOfPrimitives(Arrays.asList("string", "string"));
    }
}
