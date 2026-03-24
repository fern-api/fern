package example

import (
    context "context"

    client "github.com/exhaustive/fern/client"
    endpoints "github.com/exhaustive/fern/endpoints"
    option "github.com/exhaustive/fern/option"
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
    request := &endpoints.GetWithPathAndQuery{
        Query: "query",
    }
    client.Endpoints.Params.GetWithPathAndQuery(
        context.TODO(),
        "param",
        request,
    )
}
