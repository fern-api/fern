package example

import (
    context "context"

    client "github.com/literal-user-agent/fern/client"
    option "github.com/literal-user-agent/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.Ping(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
