package com.snippets;

import com.seed.trace.SeedTraceClient;
import java.util.Arrays;

public class Example10 {
    public static void main(String[] args) {
        SeedTraceClient client = SeedTraceClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.homepage().setHomepageProblems(Arrays.asList("string", "string"));
    }
}
