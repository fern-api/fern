package example

import (
    client "github.com/mixed-file-directory/fern/client"
    context "context"
    events "github.com/mixed-file-directory/fern/user/events"
)

func do() () {
    client := client.NewClient()
    client.User.Events.Metadata.GetMetadata(
        context.TODO(),
        &events.GetEventMetadataRequest{
            Id: "id",
        },
    )
}
