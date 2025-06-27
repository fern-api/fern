package example

import (
    client "github.com/mixed-file-directory/fern/client"
    option "github.com/mixed-file-directory/fern/option"
    context "context"
    events "github.com/mixed-file-directory/fern/user/events"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.User.Events.Metadata.GetMetadata(
        context.TODO(),
        &events.GetEventMetadataRequest{
            Id: "id",
        },
    )
}
