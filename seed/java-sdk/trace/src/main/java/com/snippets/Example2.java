package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.admin.requests.AdminUpdateTestSubmissionStatusRequest;
import com.seed.api.types.TestSubmissionStatus;
import com.seed.api.types.TestSubmissionStatusStopped;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.admin()
                .updatetestsubmissionstatus(
                        "submissionId",
                        AdminUpdateTestSubmissionStatusRequest.builder()
                                .body(TestSubmissionStatus.stopped(
                                        TestSubmissionStatusStopped.builder().build()))
                                .build());
    }
}
