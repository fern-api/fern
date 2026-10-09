package example

import (
    context "context"

    uuid "github.com/google/uuid"
    fern "github.com/trace/fern"
    client "github.com/trace/fern/client"
    common "github.com/trace/fern/common"
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
    request := &fern.StoreTracedTestCaseRequest{
        Result: &fern.TestCaseResultWithStdout{
            Result: &fern.TestCaseResult{
                ExpectedResult: &common.VariableValue{},
                ActualResult: &fern.ActualResult{
                    Value: &common.VariableValue{},
                },
                Passed: true,
            },
            Stdout: "stdout",
        },
        TraceResponses: []*fern.TraceResponse{
            &fern.TraceResponse{
                SubmissionID: uuid.MustParse(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                ),
                LineNumber: 1,
                ReturnValue: &fern.DebugVariableValue{},
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
                                Variables: map[string]*fern.DebugVariableValue{
                                    "variables": &fern.DebugVariableValue{},
                                },
                            },
                            &fern.Scope{
                                Variables: map[string]*fern.DebugVariableValue{
                                    "variables": &fern.DebugVariableValue{},
                                },
                            },
                        },
                    },
                },
                Stdout: fern.String(
                    "stdout",
                ),
            },
            &fern.TraceResponse{
                SubmissionID: uuid.MustParse(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                ),
                LineNumber: 1,
                ReturnValue: &fern.DebugVariableValue{},
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
                                Variables: map[string]*fern.DebugVariableValue{
                                    "variables": &fern.DebugVariableValue{},
                                },
                            },
                            &fern.Scope{
                                Variables: map[string]*fern.DebugVariableValue{
                                    "variables": &fern.DebugVariableValue{},
                                },
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
    client.Admin.StoreTracedTestCase(
        context.TODO(),
        uuid.MustParse(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        ),
        "testCaseId",
        request,
    )
}
