package example

import (
    context "context"

    client "github.com/websocket/fern/client"
    option "github.com/websocket/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.Status.GetStatus(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
