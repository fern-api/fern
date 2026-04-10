package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.admin.requests.AdminStoreTracedTestCaseRequest;
import com.seed.api.types.ActualResult;
import com.seed.api.types.ActualResultZero;
import com.seed.api.types.ActualResultZeroType;
import com.seed.api.types.DebugVariableValue;
import com.seed.api.types.DebugVariableValueZero;
import com.seed.api.types.DebugVariableValueZeroType;
import com.seed.api.types.ExpressionLocation;
import com.seed.api.types.Scope;
import com.seed.api.types.StackFrame;
import com.seed.api.types.StackInformation;
import com.seed.api.types.TestCaseResult;
import com.seed.api.types.TestCaseResultWithStdout;
import com.seed.api.types.TraceResponse;
import com.seed.api.types.VariableValue;
import com.seed.api.types.VariableValueZero;
import com.seed.api.types.VariableValueZeroType;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example11 {
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
                                                        .value(Optional.of(1))
                                                        .build()))
                                                .actualResult(ActualResult.of(ActualResultZero.builder()
                                                        .type(ActualResultZeroType.VALUE)
                                                        .value(Optional.of(VariableValue.of(VariableValueZero.builder()
                                                                .type(VariableValueZeroType.INTEGER_VALUE)
                                                                .value(Optional.of(1))
                                                                .build())))
                                                        .build()))
                                                .passed(true)
                                                .build())
                                        .stdout("stdout")
                                        .build())
                                .traceResponses(Arrays.asList(
                                        TraceResponse.builder()
                                                .submissionId("submissionId")
                                                .lineNumber(1)
                                                .stack(StackInformation.builder()
                                                        .numStackFrames(1)
                                                        .topStackFrame(StackFrame.builder()
                                                                .methodName("methodName")
                                                                .lineNumber(1)
                                                                .scopes(Arrays.asList(
                                                                        Scope.builder()
                                                                                .variables(
                                                                                        new HashMap<
                                                                                                String,
                                                                                                DebugVariableValue>())
                                                                                .build(),
                                                                        Scope.builder()
                                                                                .variables(
                                                                                        new HashMap<
                                                                                                String,
                                                                                                DebugVariableValue>())
                                                                                .build()))
                                                                .build())
                                                        .build())
                                                .returnValue(DebugVariableValue.of(DebugVariableValueZero.builder()
                                                        .type(DebugVariableValueZeroType.INTEGER_VALUE)
                                                        .value(Optional.of(1))
                                                        .build()))
                                                .expressionLocation(ExpressionLocation.builder()
                                                        .start(1)
                                                        .offset(1)
                                                        .build())
                                                .stdout("stdout")
                                                .build(),
                                        TraceResponse.builder()
                                                .submissionId("submissionId")
                                                .lineNumber(1)
                                                .stack(StackInformation.builder()
                                                        .numStackFrames(1)
                                                        .topStackFrame(StackFrame.builder()
                                                                .methodName("methodName")
                                                                .lineNumber(1)
                                                                .scopes(Arrays.asList(
                                                                        Scope.builder()
                                                                                .variables(
                                                                                        new HashMap<
                                                                                                String,
                                                                                                DebugVariableValue>())
                                                                                .build(),
                                                                        Scope.builder()
                                                                                .variables(
                                                                                        new HashMap<
                                                                                                String,
                                                                                                DebugVariableValue>())
                                                                                .build()))
                                                                .build())
                                                        .build())
                                                .returnValue(DebugVariableValue.of(DebugVariableValueZero.builder()
                                                        .type(DebugVariableValueZeroType.INTEGER_VALUE)
                                                        .value(Optional.of(1))
                                                        .build()))
                                                .expressionLocation(ExpressionLocation.builder()
                                                        .start(1)
                                                        .offset(1)
                                                        .build())
                                                .stdout("stdout")
                                                .build()))
                                .build());
    }
}
