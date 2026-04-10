package com.snippets;

import com.seed.api.SeedApiClient;
import java.util.Arrays;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsContainer().endpointsContainerGetAndReturnListOfPrimitives(Arrays.asList("string", "string"));
    }
}
