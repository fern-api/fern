package com.snippets;

import com.fern.sdk.SeedApiClient;
import java.util.Arrays;

public class Example16 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().container().getAndReturnSetOfPrimitives(
            Arrays.asList("string", "string")
        );
    }
}