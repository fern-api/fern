package com.snippets;

import com.fern.sdk.SeedApiClient;
import java.util.Arrays;

public class Example4 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsContainer().endpointsContainerGetAndReturnSetOfPrimitives(
            Arrays.asList("string")
        );
    }
}