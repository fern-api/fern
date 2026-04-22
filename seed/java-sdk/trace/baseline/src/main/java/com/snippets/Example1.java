package com.snippets;

import com.seed.trace.SeedTraceClient;
import com.seed.trace.resources.submission.types.TestSubmissionStatus;
import java.util.UUID;

public class Example1 {
    public static void main(String[] args) {
        SeedTraceClient client = SeedTraceClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.admin()
                .updateTestSubmissionStatus(
                        UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"), TestSubmissionStatus.stopped());
    }
}
