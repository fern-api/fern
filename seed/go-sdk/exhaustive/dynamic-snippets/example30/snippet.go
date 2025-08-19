package example

import (
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    context "context"
    endpoints "github.com/exhaustive/fern/endpoints"
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
    client.Endpoints.Params.GetWithQuery(
        context.TODO(),
        &endpoints.GetWithQuery{
            Query: "query",
            Number: 1,
        },
    )
}
