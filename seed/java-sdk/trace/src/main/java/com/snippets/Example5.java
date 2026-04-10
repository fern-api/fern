package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.admin.requests.AdminSendTestSubmissionUpdateRequest;
import com.seed.api.types.RunningSubmissionState;
import com.seed.api.types.TestSubmissionUpdate;
import com.seed.api.types.TestSubmissionUpdateInfo;
import com.seed.api.types.TestSubmissionUpdateInfoZero;
import com.seed.api.types.TestSubmissionUpdateInfoZeroType;
import java.time.OffsetDateTime;
import java.util.Optional;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.admin()
                .sendtestsubmissionupdate(
                        "submissionId",
                        AdminSendTestSubmissionUpdateRequest.builder()
                                .body(TestSubmissionUpdate.builder()
                                        .updateTime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                        .updateInfo(TestSubmissionUpdateInfo.of(TestSubmissionUpdateInfoZero.builder()
                                                .type(TestSubmissionUpdateInfoZeroType.RUNNING)
                                                .value(Optional.of(RunningSubmissionState.QUEUEING_SUBMISSION))
                                                .build()))
                                        .build())
                                .build());
    }
}
