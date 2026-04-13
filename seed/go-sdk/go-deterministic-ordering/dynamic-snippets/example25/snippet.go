package example

import (
    context "context"

    fern "github.com/go-deterministic-ordering/fern"
    client "github.com/go-deterministic-ordering/fern/client"
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
    request := &fern.EndpointsDuplicateNamesAGetRequest{
        ID: "id",
        Filter: fern.String(
            "filter",
        ),
    }
    client.EndpointsDuplicateNamesA.EndpointsDuplicateNamesAGet(
        context.TODO(),
        request,
    )
}
