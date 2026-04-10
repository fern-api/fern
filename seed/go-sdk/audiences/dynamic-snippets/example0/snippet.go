package example

import (
    context "context"

    fern "github.com/audiences/fern"
    client "github.com/audiences/fern/client"
    option "github.com/audiences/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.FolderAServiceGetDirectThreadRequest{
        IDs: []*string{
            fern.String(
                "ids",
            ),
        },
        Tags: []*string{
            fern.String(
                "tags",
            ),
        },
    }
    client.FolderAService.FolderAServiceGetDirectThread(
        context.TODO(),
        request,
    )
}
