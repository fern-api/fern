package com.snippets;

import com.seed.api.SeedApiClient;

public class Example64 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.v2V3Problem().v2V3ProblemGetLightweightProblems();
    }
}
