package example

import (
    context "context"

    fern "github.com/trace/fern"
    client "github.com/trace/fern/client"
    option "github.com/trace/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.AdminStoreTracedTestCaseRequest{
        SubmissionID: "submissionId",
        TestCaseID: "testCaseId",
        Result: &fern.TestCaseResultWithStdout{
            Result: &fern.TestCaseResult{
                ExpectedResult: &fern.VariableValue{
                    VariableValueZero: &fern.VariableValueZero{
                        Type: fern.VariableValueZeroTypeIntegerValue,
                        Value: fern.Int(
                            1,
                        ),
                    },
                },
                ActualResult: &fern.ActualResult{
                    ActualResultZero: &fern.ActualResultZero{
                        Type: fern.ActualResultZeroTypeValue,
                        Value: &fern.VariableValue{
                            VariableValueZero: &fern.VariableValueZero{
                                Type: fern.VariableValueZeroTypeIntegerValue,
                                Value: fern.Int(
                                    1,
                                ),
                            },
                        },
                    },
                },
                Passed: true,
            },
            Stdout: "stdout",
        },
        TraceResponses: []*fern.TraceResponse{
            &fern.TraceResponse{
                SubmissionID: "submissionId",
                LineNumber: 1,
                ReturnValue: &fern.DebugVariableValue{
                    DebugVariableValueZero: &fern.DebugVariableValueZero{
                        Type: fern.DebugVariableValueZeroTypeIntegerValue,
                        Value: fern.Int(
                            1,
                        ),
                    },
                },
                ExpressionLocation: &fern.ExpressionLocation{
                    Start: 1,
                    Offset: 1,
                },
                Stack: &fern.StackInformation{
                    NumStackFrames: 1,
                    TopStackFrame: &fern.StackFrame{
                        MethodName: "methodName",
                        LineNumber: 1,
                        Scopes: []*fern.Scope{
                            &fern.Scope{
                                Variables: map[string]*fern.DebugVariableValue{},
                            },
                            &fern.Scope{
                                Variables: map[string]*fern.DebugVariableValue{},
                            },
                        },
                    },
                },
                Stdout: fern.String(
                    "stdout",
                ),
            },
            &fern.TraceResponse{
                SubmissionID: "submissionId",
                LineNumber: 1,
                ReturnValue: &fern.DebugVariableValue{
                    DebugVariableValueZero: &fern.DebugVariableValueZero{
                        Type: fern.DebugVariableValueZeroTypeIntegerValue,
                        Value: fern.Int(
                            1,
                        ),
                    },
                },
                ExpressionLocation: &fern.ExpressionLocation{
                    Start: 1,
                    Offset: 1,
                },
                Stack: &fern.StackInformation{
                    NumStackFrames: 1,
                    TopStackFrame: &fern.StackFrame{
                        MethodName: "methodName",
                        LineNumber: 1,
                        Scopes: []*fern.Scope{
                            &fern.Scope{
                                Variables: map[string]*fern.DebugVariableValue{},
                            },
                            &fern.Scope{
                                Variables: map[string]*fern.DebugVariableValue{},
                            },
                        },
                    },
                },
                Stdout: fern.String(
                    "stdout",
                ),
            },
        },
    }
    client.Admin.Storetracedtestcase(
        context.TODO(),
        request,
    )
}
