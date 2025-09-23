package com.snippets;

import com.seed.trace.SeedTraceClient;
import com.seed.trace.resources.submission.types.TestSubmissionUpdate;
import com.seed.trace.resources.submission.types.TestSubmissionUpdateInfo;
import java.time.OffsetDateTime;

public class Example2 {
    public static void main(String[] args) {
        SeedTraceClient client = SeedTraceClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.admin().sendTestSubmissionUpdate(
            d5e9c84fC2b24bf4B4b07ffd7a9ffc32,
            TestSubmissionUpdate
                .builder()
                .updateTime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .updateInfo(
                    TestSubmissionUpdateInfo.running()
                )
                .build()
        );
    }
}