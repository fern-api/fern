package com.snippets;

import com.seed.trace.SeedTraceClient;
import com.seed.trace.resources.submission.types.RunningSubmissionState;
import com.seed.trace.resources.submission.types.TestSubmissionUpdate;
import com.seed.trace.resources.submission.types.TestSubmissionUpdateInfo;
import java.time.OffsetDateTime;
import java.util.UUID;

public class Example2 {
    public static void main(String[] args) {
        SeedTraceClient client = SeedTraceClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.admin()
                .sendTestSubmissionUpdate(
                        UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                        TestSubmissionUpdate.builder()
                                .updateTime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .updateInfo(
                                        TestSubmissionUpdateInfo.running(RunningSubmissionState.QUEUEING_SUBMISSION))
                                .build());
    }
}
