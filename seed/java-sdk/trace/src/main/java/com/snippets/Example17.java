package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.admin.requests.AdminStoreTracedWorkspaceV2Request;
import com.seed.api.types.DebugVariableValue;
import com.seed.api.types.DebugVariableValueZero;
import com.seed.api.types.DebugVariableValueZeroType;
import com.seed.api.types.ExpressionLocation;
import com.seed.api.types.Scope;
import com.seed.api.types.StackFrame;
import com.seed.api.types.StackInformation;
import com.seed.api.types.TraceResponseV2;
import com.seed.api.types.TracedFile;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example17 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.admin()
                .storetracedworkspacev2(
                        "submissionId",
                        AdminStoreTracedWorkspaceV2Request.builder()
                                .body(Arrays.asList(
                                        TraceResponseV2.builder()
                                                .submissionId("submissionId")
                                                .lineNumber(1)
                                                .file(TracedFile.builder()
                                                        .filename("filename")
                                                        .directory("directory")
                                                        .build())
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
                                                                                                                .of(
                                                                                                                        DebugVariableValueZero
                                                                                                                                .builder()
                                                                                                                                .type(
                                                                                                                                        DebugVariableValueZeroType
                                                                                                                                                .INTEGER_VALUE)
                                                                                                                                .build()));
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
                                                                                                                .of(
                                                                                                                        DebugVariableValueZero
                                                                                                                                .builder()
                                                                                                                                .type(
                                                                                                                                        DebugVariableValueZeroType
                                                                                                                                                .INTEGER_VALUE)
                                                                                                                                .build()));
                                                                                            }
                                                                                        })
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
                                        TraceResponseV2.builder()
                                                .submissionId("submissionId")
                                                .lineNumber(1)
                                                .file(TracedFile.builder()
                                                        .filename("filename")
                                                        .directory("directory")
                                                        .build())
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
                                                                                                                .of(
                                                                                                                        DebugVariableValueZero
                                                                                                                                .builder()
                                                                                                                                .type(
                                                                                                                                        DebugVariableValueZeroType
                                                                                                                                                .INTEGER_VALUE)
                                                                                                                                .build()));
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
                                                                                                                .of(
                                                                                                                        DebugVariableValueZero
                                                                                                                                .builder()
                                                                                                                                .type(
                                                                                                                                        DebugVariableValueZeroType
                                                                                                                                                .INTEGER_VALUE)
                                                                                                                                .build()));
                                                                                            }
                                                                                        })
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
