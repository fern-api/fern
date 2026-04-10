package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.admin.requests.AdminStoreTracedWorkspaceRequest;
import com.seed.api.types.StackInformation;
import com.seed.api.types.TraceResponse;
import com.seed.api.types.WorkspaceRunDetails;
import java.util.Arrays;

public class Example14 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.admin()
                .storetracedworkspace(
                        "submissionId",
                        AdminStoreTracedWorkspaceRequest.builder()
                                .workspaceRunDetails(WorkspaceRunDetails.builder()
                                        .stdout("stdout")
                                        .build())
                                .traceResponses(Arrays.asList(TraceResponse.builder()
                                        .submissionId("submissionId")
                                        .lineNumber(1)
                                        .stack(StackInformation.builder()
                                                .numStackFrames(1)
                                                .build())
                                        .build()))
                                .build());
    }
}
