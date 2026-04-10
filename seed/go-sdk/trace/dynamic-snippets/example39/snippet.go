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
    request := &fern.ProblemUpdateProblemRequest{
        ProblemID: "problemId",
        Body: &fern.CreateProblemRequest{
            ProblemName: "problemName",
            ProblemDescription: &fern.ProblemDescription{
                Boards: []*fern.ProblemDescriptionBoard{
                    &fern.ProblemDescriptionBoard{
                        HTML: &fern.ProblemDescriptionBoardHTML{
                            Value: fern.String(
                                "value",
                            ),
                        },
                    },
                    &fern.ProblemDescriptionBoard{
                        HTML: &fern.ProblemDescriptionBoardHTML{
                            Value: fern.String(
                                "value",
                            ),
                        },
                    },
                },
            },
            Files: map[string]*fern.ProblemFiles{
                "files": &fern.ProblemFiles{
                    SolutionFile: &fern.FileInfo{
                        Filename: "filename",
                        Contents: "contents",
                    },
                    ReadOnlyFiles: []*fern.FileInfo{
                        &fern.FileInfo{
                            Filename: "filename",
                            Contents: "contents",
                        },
                        &fern.FileInfo{
                            Filename: "filename",
                            Contents: "contents",
                        },
                    },
                },
            },
            InputParams: []*fern.VariableTypeAndName{
                &fern.VariableTypeAndName{
                    VariableType: &fern.VariableType{
                        VariableTypeZero: &fern.VariableTypeZero{
                            Type: fern.VariableTypeZeroTypeIntegerType,
                        },
                    },
                    Name: "name",
                },
                &fern.VariableTypeAndName{
                    VariableType: &fern.VariableType{
                        VariableTypeZero: &fern.VariableTypeZero{
                            Type: fern.VariableTypeZeroTypeIntegerType,
                        },
                    },
                    Name: "name",
                },
            },
            OutputType: &fern.VariableType{
                VariableTypeZero: &fern.VariableTypeZero{
                    Type: fern.VariableTypeZeroTypeIntegerType,
                },
            },
            Testcases: []*fern.TestCaseWithExpectedResult{
                &fern.TestCaseWithExpectedResult{
                    TestCase: &fern.TestCase{
                        ID: "id",
                        Params: []*fern.VariableValue{
                            &fern.VariableValue{
                                VariableValueZero: &fern.VariableValueZero{
                                    Type: fern.VariableValueZeroTypeIntegerValue,
                                    Value: fern.Int(
                                        1,
                                    ),
                                },
                            },
                            &fern.VariableValue{
                                VariableValueZero: &fern.VariableValueZero{
                                    Type: fern.VariableValueZeroTypeIntegerValue,
                                    Value: fern.Int(
                                        1,
                                    ),
                                },
                            },
                        },
                    },
                    ExpectedResult: &fern.VariableValue{
                        VariableValueZero: &fern.VariableValueZero{
                            Type: fern.VariableValueZeroTypeIntegerValue,
                            Value: fern.Int(
                                1,
                            ),
                        },
                    },
                },
                &fern.TestCaseWithExpectedResult{
                    TestCase: &fern.TestCase{
                        ID: "id",
                        Params: []*fern.VariableValue{
                            &fern.VariableValue{
                                VariableValueZero: &fern.VariableValueZero{
                                    Type: fern.VariableValueZeroTypeIntegerValue,
                                    Value: fern.Int(
                                        1,
                                    ),
                                },
                            },
                            &fern.VariableValue{
                                VariableValueZero: &fern.VariableValueZero{
                                    Type: fern.VariableValueZeroTypeIntegerValue,
                                    Value: fern.Int(
                                        1,
                                    ),
                                },
                            },
                        },
                    },
                    ExpectedResult: &fern.VariableValue{
                        VariableValueZero: &fern.VariableValueZero{
                            Type: fern.VariableValueZeroTypeIntegerValue,
                            Value: fern.Int(
                                1,
                            ),
                        },
                    },
                },
            },
            MethodName: "methodName",
        },
    }
    client.Problem.Updateproblem(
        context.TODO(),
        request,
    )
}
