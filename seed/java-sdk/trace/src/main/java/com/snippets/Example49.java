package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.submission.requests.SubmissionStopExecutionSessionRequest;

public class Example49 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.submission()
                .stopexecutionsession(
                        "sessionId",
                        SubmissionStopExecutionSessionRequest.builder().build());
    }
}
