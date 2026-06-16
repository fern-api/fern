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
                &fern.ProblemDescriptionBoard{},
                &fern.ProblemDescriptionBoard{},
            },
        },
        Files: map[fern.Language]*fern.ProblemFiles{
            fern.LanguageJava: &fern.ProblemFiles{
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
                    IntegerType: "integerType",
                },
                Name: "name",
            },
            &fern.VariableTypeAndName{
                VariableType: &fern.VariableType{
                    IntegerType: "integerType",
                },
                Name: "name",
            },
        },
        OutputType: &fern.VariableType{
            IntegerType: "integerType",
        },
        Testcases: []*fern.TestCaseWithExpectedResult{
            &fern.TestCaseWithExpectedResult{
                TestCase: &fern.TestCase{
                    ID: "id",
                    Params: []*fern.VariableValue{
                        &fern.VariableValue{},
                        &fern.VariableValue{},
                    },
                },
                ExpectedResult: &fern.VariableValue{},
            },
            &fern.TestCaseWithExpectedResult{
                TestCase: &fern.TestCase{
                    ID: "id",
                    Params: []*fern.VariableValue{
                        &fern.VariableValue{},
                        &fern.VariableValue{},
                    },
                },
                ExpectedResult: &fern.VariableValue{},
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
