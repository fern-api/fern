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
    request := &endpoints.GetWithInlinePathAndQuery{
        Param: "param",
        Query: "query",
    }
    err := client.Endpoints.Params.GetWithInlinePathAndQuery(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
