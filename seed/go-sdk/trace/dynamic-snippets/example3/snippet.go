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
    request := &fern.AdminUpdateTestSubmissionStatusRequest{
        SubmissionID: "submissionId",
        Body: &fern.TestSubmissionStatus{
            Stopped: &fern.TestSubmissionStatusStopped{},
        },
    }
    client.Admin.Updatetestsubmissionstatus(
        context.TODO(),
        request,
    )
}
