package example

import (
    client "github.com/accept-header/fern/client"
    option "github.com/accept-header/fern/option"
    context "context"
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
