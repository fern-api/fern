package example

import (
    context "context"

    client "github.com/go-deterministic-ordering/fern/client"
    endpoints "github.com/go-deterministic-ordering/fern/endpoints"
    option "github.com/go-deterministic-ordering/fern/option"
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
    request := &endpoints.CreateRequestA{
        Name: "name",
        Value: 1,
    }
    client.Endpoints.DuplicateNamesA.Create(
        context.TODO(),
        request,
    )
}
