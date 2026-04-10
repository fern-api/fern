package com.snippets;

import com.seed.api.SeedApiClient;

public class Example59 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.v2Problem().v2ProblemGetProblems();
    }
}
