package example

import (
    client "github.com/optional/fern/client"
    option "github.com/optional/fern/option"
    fern "github.com/optional/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SendOptionalBodyRequest{
        Message: "message",
    }
    client.Optional.SendOptionalTypedBody(
        context.TODO(),
        request,
    )
}
