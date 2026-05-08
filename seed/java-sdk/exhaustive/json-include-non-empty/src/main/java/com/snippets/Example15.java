package com.snippets;

import com.seed.api.SeedApiClient;
import java.util.Arrays;

public class Example15 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().container().getAndReturnSetOfPrimitives(Arrays.asList("string"));
    }
}
