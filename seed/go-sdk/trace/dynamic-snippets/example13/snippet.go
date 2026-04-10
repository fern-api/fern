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
    request := &fern.AdminStoreTracedTestCaseV2Request{
        SubmissionID: "submissionId",
        TestCaseID: "testCaseId",
        Body: []*fern.TraceResponseV2{
            &fern.TraceResponseV2{
                SubmissionID: "submissionId",
                LineNumber: 1,
                File: &fern.TracedFile{
                    Filename: "filename",
                    Directory: "directory",
                },
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
                                Variables: map[string]*fern.DebugVariableValue{
                                    "variables": &fern.DebugVariableValue{
                                        DebugVariableValueZero: &fern.DebugVariableValueZero{
                                            Type: fern.DebugVariableValueZeroTypeIntegerValue,
                                        },
                                    },
                                },
                            },
                            &fern.Scope{
                                Variables: map[string]*fern.DebugVariableValue{
                                    "variables": &fern.DebugVariableValue{
                                        DebugVariableValueZero: &fern.DebugVariableValueZero{
                                            Type: fern.DebugVariableValueZeroTypeIntegerValue,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                Stdout: fern.String(
                    "stdout",
                ),
            },
            &fern.TraceResponseV2{
                SubmissionID: "submissionId",
                LineNumber: 1,
                File: &fern.TracedFile{
                    Filename: "filename",
                    Directory: "directory",
                },
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
                                Variables: map[string]*fern.DebugVariableValue{
                                    "variables": &fern.DebugVariableValue{
                                        DebugVariableValueZero: &fern.DebugVariableValueZero{
                                            Type: fern.DebugVariableValueZeroTypeIntegerValue,
                                        },
                                    },
                                },
                            },
                            &fern.Scope{
                                Variables: map[string]*fern.DebugVariableValue{
                                    "variables": &fern.DebugVariableValue{
                                        DebugVariableValueZero: &fern.DebugVariableValueZero{
                                            Type: fern.DebugVariableValueZeroTypeIntegerValue,
                                        },
                                    },
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
    client.Admin.Storetracedtestcasev2(
        context.TODO(),
        request,
    )
}
