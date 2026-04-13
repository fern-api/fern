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
    request := &fern.EndpointsDuplicateNamesAListRequest{
        Page: fern.Int(
            1,
        ),
        Limit: fern.Int(
            1,
        ),
    }
    client.EndpointsDuplicateNamesA.EndpointsDuplicateNamesAList(
        context.TODO(),
        request,
    )
}
