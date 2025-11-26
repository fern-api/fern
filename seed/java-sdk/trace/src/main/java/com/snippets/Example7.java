package com.snippets;

import com.seed.trace.SeedTraceClient;
import com.seed.trace.resources.admin.requests.StoreTracedWorkspaceRequest;
import com.seed.trace.resources.commons.types.DebugVariableValue;
import com.seed.trace.resources.submission.types.ExceptionInfo;
import com.seed.trace.resources.submission.types.ExceptionV2;
import com.seed.trace.resources.submission.types.ExpressionLocation;
import com.seed.trace.resources.submission.types.Scope;
import com.seed.trace.resources.submission.types.StackFrame;
import com.seed.trace.resources.submission.types.StackInformation;
import com.seed.trace.resources.submission.types.TraceResponse;
import com.seed.trace.resources.submission.types.WorkspaceRunDetails;
import java.util.Arrays;
import java.util.HashMap;
import java.util.UUID;

public class Example7 {
    public static void main(String[] args) {
        SeedTraceClient client = SeedTraceClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.admin()
                .storeTracedWorkspace(
                        UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                        StoreTracedWorkspaceRequest.builder()
                                .workspaceRunDetails(WorkspaceRunDetails.builder()
                                        .stdout("stdout")
                                        .exceptionV2(ExceptionV2.generic(ExceptionInfo.builder()
                                                .exceptionType("exceptionType")
                                                .exceptionMessage("exceptionMessage")
                                                .exceptionStacktrace("exceptionStacktrace")
                                                .build()))
                                        .exception(ExceptionInfo.builder()
                                                .exceptionType("exceptionType")
                                                .exceptionMessage("exceptionMessage")
                                                .exceptionStacktrace("exceptionStacktrace")
                                                .build())
                                        .build())
                                .traceResponses(Arrays.asList(
                                        TraceResponse.builder()
                                                .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
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
                                                                                                DebugVariableValue>() {
                                                                                            {
                                                                                                put(
                                                                                                        "variables",
                                                                                                        DebugVariableValue
                                                                                                                .integerValue(
                                                                                                                        1));
                                                                                            }
                                                                                        })
                                                                                .build(),
                                                                        Scope.builder()
                                                                                .variables(
                                                                                        new HashMap<
                                                                                                String,
                                                                                                DebugVariableValue>() {
                                                                                            {
                                                                                                put(
                                                                                                        "variables",
                                                                                                        DebugVariableValue
                                                                                                                .integerValue(
                                                                                                                        1));
                                                                                            }
                                                                                        })
                                                                                .build()))
                                                                .build())
                                                        .build())
                                                .returnValue(DebugVariableValue.integerValue(1))
                                                .expressionLocation(ExpressionLocation.builder()
                                                        .start(1)
                                                        .offset(1)
                                                        .build())
                                                .stdout("stdout")
                                                .build(),
                                        TraceResponse.builder()
                                                .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
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
                                                                                                DebugVariableValue>() {
                                                                                            {
                                                                                                put(
                                                                                                        "variables",
                                                                                                        DebugVariableValue
                                                                                                                .integerValue(
                                                                                                                        1));
                                                                                            }
                                                                                        })
                                                                                .build(),
                                                                        Scope.builder()
                                                                                .variables(
                                                                                        new HashMap<
                                                                                                String,
                                                                                                DebugVariableValue>() {
                                                                                            {
                                                                                                put(
                                                                                                        "variables",
                                                                                                        DebugVariableValue
                                                                                                                .integerValue(
                                                                                                                        1));
                                                                                            }
                                                                                        })
                                                                                .build()))
                                                                .build())
                                                        .build())
                                                .returnValue(DebugVariableValue.integerValue(1))
                                                .expressionLocation(ExpressionLocation.builder()
                                                        .start(1)
                                                        .offset(1)
                                                        .build())
                                                .stdout("stdout")
                                                .build()))
                                .build());
    }
}
