package example

import (
    context "context"

    client "github.com/mixed-file-directory/fern/client"
    option "github.com/mixed-file-directory/fern/option"
    events "github.com/mixed-file-directory/fern/user/events"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &events.GetEventMetadataRequest{
        ID: "id",
    }
    _, err := client.User.Events.Metadata.GetMetadata(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
