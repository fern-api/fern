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
    client.Endpoints.Params.GetWithPathAndQuery(
        context.TODO(),
        "param",
        &endpoints.GetWithPathAndQuery{
            Query: "query",
        },
    )
}
