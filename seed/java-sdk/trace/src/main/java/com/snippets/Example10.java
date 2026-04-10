package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.admin.requests.AdminStoreTracedTestCaseRequest;
import com.seed.api.types.ActualResult;
import com.seed.api.types.ActualResultZero;
import com.seed.api.types.ActualResultZeroType;
import com.seed.api.types.StackInformation;
import com.seed.api.types.TestCaseResult;
import com.seed.api.types.TestCaseResultWithStdout;
import com.seed.api.types.TraceResponse;
import com.seed.api.types.VariableValue;
import com.seed.api.types.VariableValueZero;
import com.seed.api.types.VariableValueZeroType;
import java.util.Arrays;

public class Example10 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.admin()
                .storetracedtestcase(
                        "submissionId",
                        "testCaseId",
                        AdminStoreTracedTestCaseRequest.builder()
                                .result(TestCaseResultWithStdout.builder()
                                        .result(TestCaseResult.builder()
                                                .expectedResult(VariableValue.of(VariableValueZero.builder()
                                                        .type(VariableValueZeroType.INTEGER_VALUE)
                                                        .build()))
                                                .actualResult(ActualResult.of(ActualResultZero.builder()
                                                        .type(ActualResultZeroType.VALUE)
                                                        .build()))
                                                .passed(true)
                                                .build())
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
