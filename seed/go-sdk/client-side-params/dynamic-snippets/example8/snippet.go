package example

import (
    client "github.com/client-side-params/fern/client"
    option "github.com/client-side-params/fern/option"
    context "context"
    fern "github.com/client-side-params/fern"
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
    client.Service.ListConnections(
        context.TODO(),
        &fern.ListConnectionsRequest{
            Strategy: fern.String(
                "strategy",
            ),
            Name: fern.String(
                "name",
            ),
            Fields: fern.String(
                "fields",
            ),
        },
    )
}
