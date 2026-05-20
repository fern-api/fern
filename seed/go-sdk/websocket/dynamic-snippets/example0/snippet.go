package example

import (
    context "context"

    client "github.com/websocket/fern/client"
    option "github.com/websocket/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Status.GetStatus(
        context.TODO(),
    )
}
