package com.snippets;

import com.seed.trace.SeedTraceClient;
import com.seed.trace.resources.submission.types.WorkspaceSubmissionStatus;

public class Example3 {
    public static void main(String[] args) {
        SeedTraceClient client = SeedTraceClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.admin().updateWorkspaceSubmissionStatus(
            d5e9c84fC2b24bf4B4b07ffd7a9ffc32,
            WorkspaceSubmissionStatus.stopped()
        );
    }
}