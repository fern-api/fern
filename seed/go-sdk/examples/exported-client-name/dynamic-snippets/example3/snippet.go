package example

import (
    context "context"

    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
)

func do() error {
    client := client.NewAcmeClient(
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
