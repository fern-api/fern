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
    request := &endpoints.GetWithQuery{
        Query: "query",
        Number: 1,
    }
    err := client.Endpoints.Params.GetWithQuery(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
