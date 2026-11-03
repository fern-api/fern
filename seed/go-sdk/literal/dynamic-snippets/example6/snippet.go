package example

import (
    context "context"

    client "github.com/literal/fern/client"
    option "github.com/literal/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.Path.Send(
        context.TODO(),
        "123",
    )
    if err != nil {
        return err
    }
    return nil
}
