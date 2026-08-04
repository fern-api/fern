package example

import (
    context "context"

    uuid "github.com/google/uuid"
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
    request := &fern.WorkspaceSubmissionStatus{
        Stopped: "stopped",
    }
    client.Admin.UpdateWorkspaceSubmissionStatus(
        context.TODO(),
        uuid.MustParse(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        ),
        request,
    )
}
