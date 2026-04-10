package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.admin.requests.AdminStoreTracedTestCaseV2Request;
import com.seed.api.types.StackInformation;
import com.seed.api.types.TraceResponseV2;
import com.seed.api.types.TracedFile;
import java.util.Arrays;

public class Example12 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.admin()
                .storetracedtestcasev2(
                        "submissionId",
                        "testCaseId",
                        AdminStoreTracedTestCaseV2Request.builder()
                                .body(Arrays.asList(TraceResponseV2.builder()
                                        .submissionId("submissionId")
                                        .lineNumber(1)
                                        .file(TracedFile.builder()
                                                .filename("filename")
                                                .directory("directory")
                                                .build())
                                        .stack(StackInformation.builder()
                                                .numStackFrames(1)
                                                .build())
                                        .build()))
                                .build());
    }
}
