package example

import (
    context "context"

    fern "github.com/optional/fern"
    client "github.com/optional/fern/client"
    option "github.com/optional/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SendOptionalBodyRequest{
        Message: "message",
    }
    _, err := client.Optional.SendOptionalTypedBody(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
