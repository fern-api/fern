package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.v2v3problem.requests.V2V3ProblemGetProblemVersionRequest;

public class Example70 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.v2V3Problem()
                .v2V3ProblemGetProblemVersion(
                        "problemId",
                        1,
                        V2V3ProblemGetProblemVersionRequest.builder().build());
    }
}
