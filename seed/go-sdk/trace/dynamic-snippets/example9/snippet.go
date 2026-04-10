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
    request := &fern.AdminSendWorkspaceSubmissionUpdateRequest{
        SubmissionID: "submissionId",
        Body: &fern.WorkspaceSubmissionUpdate{
            UpdateTime: fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
            UpdateInfo: &fern.WorkspaceSubmissionUpdateInfo{
                WorkspaceSubmissionUpdateInfoZero: &fern.WorkspaceSubmissionUpdateInfoZero{
                    Type: fern.WorkspaceSubmissionUpdateInfoZeroTypeRunning,
                    Value: fern.RunningSubmissionStateQueueingSubmission.Ptr(),
                },
            },
        },
    }
    client.Admin.Sendworkspacesubmissionupdate(
        context.TODO(),
        request,
    )
}
