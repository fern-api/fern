package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.admin.requests.AdminStoreTracedWorkspaceRequest;
import com.seed.api.types.DebugVariableValue;
import com.seed.api.types.DebugVariableValueZero;
import com.seed.api.types.DebugVariableValueZeroType;
import com.seed.api.types.ExceptionInfo;
import com.seed.api.types.ExceptionV2;
import com.seed.api.types.ExceptionV2Zero;
import com.seed.api.types.ExceptionV2ZeroType;
import com.seed.api.types.ExpressionLocation;
import com.seed.api.types.Scope;
import com.seed.api.types.StackFrame;
import com.seed.api.types.StackInformation;
import com.seed.api.types.TraceResponse;
import com.seed.api.types.WorkspaceRunDetails;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example15 {
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
                                        .exceptionV2(ExceptionV2.of(ExceptionV2Zero.builder()
                                                .exceptionType("exceptionType")
                                                .exceptionMessage("exceptionMessage")
                                                .exceptionStacktrace("exceptionStacktrace")
                                                .type(ExceptionV2ZeroType.GENERIC)
                                                .build()))
                                        .exception(ExceptionInfo.builder()
                                                .exceptionType("exceptionType")
                                                .exceptionMessage("exceptionMessage")
                                                .exceptionStacktrace("exceptionStacktrace")
                                                .build())
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
