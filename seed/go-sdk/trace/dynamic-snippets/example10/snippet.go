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
                    },
                },
                ActualResult: &fern.ActualResult{
                    ActualResultZero: &fern.ActualResultZero{
                        Type: fern.ActualResultZeroTypeValue,
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
                Stack: &fern.StackInformation{
                    NumStackFrames: 1,
                },
            },
        },
    }
    client.Admin.Storetracedtestcase(
        context.TODO(),
        request,
    )
}
