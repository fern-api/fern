package example

import (
    context "context"

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
    request := &fern.CreateProblemRequest{
        ProblemName: "problemName",
        ProblemDescription: &common.ProblemDescription{
            Boards: []*common.ProblemDescriptionBoard{
                &common.ProblemDescriptionBoard{},
                &common.ProblemDescriptionBoard{},
            },
        },
        Files: map[common.Language]*fern.ProblemFiles{
            common.LanguageJava: &fern.ProblemFiles{
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
                VariableType: &common.VariableType{
                    IntegerType: "integerType",
                },
                Name: "name",
            },
            &fern.VariableTypeAndName{
                VariableType: &common.VariableType{
                    IntegerType: "integerType",
                },
                Name: "name",
            },
        },
        OutputType: &common.VariableType{
            IntegerType: "integerType",
        },
        Testcases: []*fern.TestCaseWithExpectedResult{
            &fern.TestCaseWithExpectedResult{
                TestCase: &fern.TestCase{
                    ID: "id",
                    Params: []*common.VariableValue{
                        &common.VariableValue{},
                        &common.VariableValue{},
                    },
                },
                ExpectedResult: &common.VariableValue{},
            },
            &fern.TestCaseWithExpectedResult{
                TestCase: &fern.TestCase{
                    ID: "id",
                    Params: []*common.VariableValue{
                        &common.VariableValue{},
                        &common.VariableValue{},
                    },
                },
                ExpectedResult: &common.VariableValue{},
            },
        },
        MethodName: "methodName",
    }
    client.Problem.UpdateProblem(
        context.TODO(),
        "problemId",
        request,
    )
}
