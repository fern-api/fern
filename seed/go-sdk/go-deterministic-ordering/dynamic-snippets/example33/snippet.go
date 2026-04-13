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
    request := &fern.EndpointsDuplicateNamesCListRequest{
        Offset: fern.Int(
            1,
        ),
        Count: fern.Int(
            1,
        ),
    }
    client.EndpointsDuplicateNamesC.EndpointsDuplicateNamesCList(
        context.TODO(),
        request,
    )
}
