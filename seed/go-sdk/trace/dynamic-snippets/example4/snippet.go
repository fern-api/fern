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
    request := &fern.AdminSendTestSubmissionUpdateRequest{
        SubmissionID: "submissionId",
        Body: &fern.TestSubmissionUpdate{
            UpdateTime: fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
            UpdateInfo: &fern.TestSubmissionUpdateInfo{
                TestSubmissionUpdateInfoZero: &fern.TestSubmissionUpdateInfoZero{
                    Type: fern.TestSubmissionUpdateInfoZeroTypeRunning,
                },
            },
        },
    }
    client.Admin.Sendtestsubmissionupdate(
        context.TODO(),
        request,
    )
}
