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
    request := &fern.AdminStoreTracedWorkspaceRequest{
        SubmissionID: "submissionId",
        WorkspaceRunDetails: &fern.WorkspaceRunDetails{
            ExceptionV2: &fern.ExceptionV2{
                ExceptionV2Zero: &fern.ExceptionV2Zero{
                    Type: fern.ExceptionV2ZeroTypeGeneric,
                    ExceptionType: "exceptionType",
                    ExceptionMessage: "exceptionMessage",
                    ExceptionStacktrace: "exceptionStacktrace",
                },
            },
            Exception: &fern.ExceptionInfo{
                ExceptionType: "exceptionType",
                ExceptionMessage: "exceptionMessage",
                ExceptionStacktrace: "exceptionStacktrace",
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
    client.Admin.Storetracedworkspace(
        context.TODO(),
        request,
    )
}
