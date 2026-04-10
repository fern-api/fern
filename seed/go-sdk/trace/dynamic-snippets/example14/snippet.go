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
    client.Admin.Storetracedworkspace(
        context.TODO(),
        request,
    )
}
