package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.submission.requests.SubmissionCreateExecutionSessionRequest;
import com.seed.api.types.Language;

public class Example44 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.submission()
                .createexecutionsession(
                        Language.JAVA,
                        SubmissionCreateExecutionSessionRequest.builder().build());
    }
}
