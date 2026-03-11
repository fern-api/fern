package example

import (
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
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
    request := &fern.GetWithQuery{
        Query: "query",
        Number: 1,
    }
    client.Endpoints.Params.GetWithQuery(
        context.TODO(),
        request,
    )
}
