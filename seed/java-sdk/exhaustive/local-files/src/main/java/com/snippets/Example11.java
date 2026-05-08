package com.snippets;

import com.fern.sdk.SeedApiClient;
import java.util.Arrays;

public class Example11 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().container().getAndReturnListOfPrimitives(
            Arrays.asList("string")
        );
    }
}