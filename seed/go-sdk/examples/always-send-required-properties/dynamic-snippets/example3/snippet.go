package example

import (
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
    context "context"
)

func do() () {
    client := client.NewClient(
        option.WithToken(
            "<token>",
        ),
    )
    client.File.Notification.Service.GetException(
        context.TODO(),
        "notification-hsy129x",
    )
}
