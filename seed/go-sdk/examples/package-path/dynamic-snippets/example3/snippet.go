package example

import (
    context "context"

    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    _, err := client.File.Notification.Service.GetException(
        context.TODO(),
        "notification-hsy129x",
    )
    if err != nil {
        return err
    }
    return nil
}
