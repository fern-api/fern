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
    request := &fern.AdminStoreTracedWorkspaceV2Request{
        SubmissionID: "submissionId",
        Body: []*fern.TraceResponseV2{
            &fern.TraceResponseV2{
                SubmissionID: "submissionId",
                LineNumber: 1,
                File: &fern.TracedFile{
                    Filename: "filename",
                    Directory: "directory",
                },
                Stack: &fern.StackInformation{
                    NumStackFrames: 1,
                },
            },
        },
    }
    client.Admin.Storetracedworkspacev2(
        context.TODO(),
        request,
    )
}
