package example

import (
    context "context"
    client "github.com/accept-header/fern/client"
    option "github.com/accept-header/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    client.Service.Endpoint(
        context.TODO(),
    )
}
