package example

import (
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    endpoints "github.com/exhaustive/fern/endpoints"
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
    request := &endpoints.GetWithQuery{
        Query: "query",
        Number: 1,
    }
    client.Endpoints.Params.GetWithQuery(
        context.TODO(),
        request,
    )
}
