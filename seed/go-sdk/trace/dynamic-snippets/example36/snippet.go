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
    request := &fern.CreateProblemRequest{
        ProblemName: "problemName",
        ProblemDescription: &fern.ProblemDescription{
            Boards: []*fern.ProblemDescriptionBoard{
                &fern.ProblemDescriptionBoard{
                    HTML: &fern.ProblemDescriptionBoardHTML{},
                },
            },
        },
        Files: map[string]*fern.ProblemFiles{
            "key": &fern.ProblemFiles{
                SolutionFile: &fern.FileInfo{
                    Filename: "filename",
                    Contents: "contents",
                },
                ReadOnlyFiles: []*fern.FileInfo{
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
                            },
                        },
                    },
                },
                ExpectedResult: &fern.VariableValue{
                    VariableValueZero: &fern.VariableValueZero{
                        Type: fern.VariableValueZeroTypeIntegerValue,
                    },
                },
            },
        },
        MethodName: "methodName",
    }
    client.Problem.Createproblem(
        context.TODO(),
        request,
    )
}
