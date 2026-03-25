package example

import (
    context "context"

    client "github.com/mixed-file-directory/fern/client"
    option "github.com/mixed-file-directory/fern/option"
    events "github.com/mixed-file-directory/fern/user/events"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &events.GetEventMetadataRequest{
        Id: "id",
    }
    client.User.Events.Metadata.GetMetadata(
        context.TODO(),
        request,
    )
}
