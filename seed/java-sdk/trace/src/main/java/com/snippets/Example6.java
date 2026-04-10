package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.admin.requests.AdminUpdateWorkspaceSubmissionStatusRequest;
import com.seed.api.types.WorkspaceSubmissionStatus;
import com.seed.api.types.WorkspaceSubmissionStatusZero;
import com.seed.api.types.WorkspaceSubmissionStatusZeroType;

public class Example6 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.admin()
                .updateworkspacesubmissionstatus(
                        "submissionId",
                        AdminUpdateWorkspaceSubmissionStatusRequest.builder()
                                .body(WorkspaceSubmissionStatus.of(WorkspaceSubmissionStatusZero.builder()
                                        .type(WorkspaceSubmissionStatusZeroType.STOPPED)
                                        .build()))
                                .build());
    }
}
