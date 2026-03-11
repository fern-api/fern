package example

import (
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    endpoints "github.com/exhaustive/fern/endpoints"
    fern "github.com/exhaustive/fern"
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
    request := &endpoints.GetRequestA{
        Id: "id",
        Filter: fern.String(
            "filter",
        ),
    }
    client.Endpoints.DuplicateNamesA.Get(
        context.TODO(),
        request,
    )
}
