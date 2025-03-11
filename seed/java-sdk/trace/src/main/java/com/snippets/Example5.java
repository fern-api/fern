package com.snippets;

import com.seed.trace.SeedTraceClient;
import com.seed.trace.resources.admin.requests.StoreTracedTestCaseRequest;
import com.seed.trace.resources.commons.types.DebugVariableValue;
import com.seed.trace.resources.commons.types.VariableValue;
import com.seed.trace.resources.submission.types.ActualResult;
import com.seed.trace.resources.submission.types.ExpressionLocation;
import com.seed.trace.resources.submission.types.Scope;
import com.seed.trace.resources.submission.types.StackFrame;
import com.seed.trace.resources.submission.types.StackInformation;
import com.seed.trace.resources.submission.types.TestCaseResult;
import com.seed.trace.resources.submission.types.TestCaseResultWithStdout;
import com.seed.trace.resources.submission.types.TraceResponse;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.UUID;

public class Example5 {
    public static void run() {
        SeedTraceClient client = SeedTraceClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.admin().storeTracedTestCase(
            UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            "testCaseId",
            StoreTracedTestCaseRequest
                .builder()
                .result(
                    TestCaseResultWithStdout
                        .builder()
                        .result(
                            TestCaseResult
                                .builder()
                                .expectedResult(
                                    VariableValue.integerValue()
                                )
                                .actualResult(
                                    ActualResult.value(
                                        VariableValue.integerValue()
                                    )
                                )
                                .passed(true)
                                .build()
                        )
                        .stdout("stdout")
                        .build()
                )
                .traceResponses(
                    new ArrayList<TraceResponse>(
                        Arrays.asList(
                            TraceResponse
                                .builder()
                                .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                                .lineNumber(1)
                                .stack(
                                    StackInformation
                                        .builder()
                                        .numStackFrames(1)
                                        .topStackFrame(
                                            StackFrame
                                                .builder()
                                                .methodName("methodName")
                                                .lineNumber(1)
                                                .scopes(
                                                    new ArrayList<Scope>(
                                                        Arrays.asList(
                                                            Scope
                                                                .builder()
                                                                .variables(
                                                                    new HashMap<String, DebugVariableValue>() {{
                                                                        put("variables", DebugVariableValue.integerValue());
                                                                    }}
                                                                )
                                                                .build(),
                                                            Scope
                                                                .builder()
                                                                .variables(
                                                                    new HashMap<String, DebugVariableValue>() {{
                                                                        put("variables", DebugVariableValue.integerValue());
                                                                    }}
                                                                )
                                                                .build()
                                                        )
                                                    )
                                                )
                                                .build()
                                        )
                                        .build()
                                )
                                .returnValue(
                                    DebugVariableValue.integerValue()
                                )
                                .expressionLocation(
                                    ExpressionLocation
                                        .builder()
                                        .start(1)
                                        .offset(1)
                                        .build()
                                )
                                .stdout("stdout")
                                .build(),
                            TraceResponse
                                .builder()
                                .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                                .lineNumber(1)
                                .stack(
                                    StackInformation
                                        .builder()
                                        .numStackFrames(1)
                                        .topStackFrame(
                                            StackFrame
                                                .builder()
                                                .methodName("methodName")
                                                .lineNumber(1)
                                                .scopes(
                                                    new ArrayList<Scope>(
                                                        Arrays.asList(
                                                            Scope
                                                                .builder()
                                                                .variables(
                                                                    new HashMap<String, DebugVariableValue>() {{
                                                                        put("variables", DebugVariableValue.integerValue());
                                                                    }}
                                                                )
                                                                .build(),
                                                            Scope
                                                                .builder()
                                                                .variables(
                                                                    new HashMap<String, DebugVariableValue>() {{
                                                                        put("variables", DebugVariableValue.integerValue());
                                                                    }}
                                                                )
                                                                .build()
                                                        )
                                                    )
                                                )
                                                .build()
                                        )
                                        .build()
                                )
                                .returnValue(
                                    DebugVariableValue.integerValue()
                                )
                                .expressionLocation(
                                    ExpressionLocation
                                        .builder()
                                        .start(1)
                                        .offset(1)
                                        .build()
                                )
                                .stdout("stdout")
                                .build()
                        )
                    )
                )
                .build()
        );
    }
}