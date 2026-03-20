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
    request := &fern.GetRequestB{
        Id: "id",
        Expand: fern.Bool(
            true,
        ),
    }
    client.Endpoints.DuplicateNamesB.Get(
        context.TODO(),
        request,
    )
}
