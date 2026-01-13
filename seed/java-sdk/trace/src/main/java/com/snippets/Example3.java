package com.snippets;

import com.seed.trace.SeedTraceClient;
import com.seed.trace.resources.submission.types.WorkspaceSubmissionStatus;
import java.util.UUID;

public class Example3 {
    public static void main(String[] args) {
        SeedTraceClient client = SeedTraceClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.admin().updateWorkspaceSubmissionStatus(
            UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            WorkspaceSubmissionStatus.stopped()
        );
    }
}