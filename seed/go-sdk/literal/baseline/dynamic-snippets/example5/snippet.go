package example

import (
    context "context"

    client "github.com/literal/fern/client"
    option "github.com/literal/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Path.Send(
        context.TODO(),
        nil,
    )
}
