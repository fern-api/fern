package example

import (
    client "github.com/go-deterministic-ordering/fern/client"
    option "github.com/go-deterministic-ordering/fern/option"
    fern "github.com/go-deterministic-ordering/fern"
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
    request := &fern.ListRequestB{
        Cursor: fern.String(
            "cursor",
        ),
        Size: fern.Int(
            1,
        ),
    }
    client.Endpoints.DuplicateNamesB.List(
        context.TODO(),
        request,
    )
}
