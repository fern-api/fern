package example

import (
    context "context"

    client "github.com/exhaustive/fern/client"
    endpoints "github.com/exhaustive/fern/endpoints"
    option "github.com/exhaustive/fern/option"
)

func do() error {
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
    err := client.Endpoints.Params.GetWithPathAndQuery(
        context.TODO(),
        "param",
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
