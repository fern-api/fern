package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.admin.requests.AdminSendWorkspaceSubmissionUpdateRequest;
import com.seed.api.types.WorkspaceSubmissionUpdate;
import com.seed.api.types.WorkspaceSubmissionUpdateInfo;
import com.seed.api.types.WorkspaceSubmissionUpdateInfoZero;
import com.seed.api.types.WorkspaceSubmissionUpdateInfoZeroType;
import java.time.OffsetDateTime;

public class Example8 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.admin()
                .sendworkspacesubmissionupdate(
                        "submissionId",
                        AdminSendWorkspaceSubmissionUpdateRequest.builder()
                                .body(WorkspaceSubmissionUpdate.builder()
                                        .updateTime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                        .updateInfo(WorkspaceSubmissionUpdateInfo.of(
                                                WorkspaceSubmissionUpdateInfoZero.builder()
                                                        .type(WorkspaceSubmissionUpdateInfoZeroType.RUNNING)
                                                        .build()))
                                        .build())
                                .build());
    }
}
