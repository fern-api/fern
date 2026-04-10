package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.v2problem.requests.V2ProblemGetProblemVersionRequest;

public class Example63 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.v2Problem()
                .v2ProblemGetProblemVersion(
                        "problemId",
                        1,
                        V2ProblemGetProblemVersionRequest.builder().build());
    }
}
