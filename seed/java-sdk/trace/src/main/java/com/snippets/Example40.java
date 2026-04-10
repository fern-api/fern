package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.problem.requests.ProblemDeleteProblemRequest;

public class Example40 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.problem()
                .deleteproblem(
                        "problemId", ProblemDeleteProblemRequest.builder().build());
    }
}
