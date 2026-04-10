package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.submission.requests.SubmissionGetExecutionSessionRequest;

public class Example46 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.submission()
                .getexecutionsession(
                        "sessionId",
                        SubmissionGetExecutionSessionRequest.builder().build());
    }
}
