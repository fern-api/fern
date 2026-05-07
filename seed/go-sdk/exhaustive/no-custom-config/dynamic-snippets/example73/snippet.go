package example

import (
    context "context"

    fern "github.com/exhaustive/fern"
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
    request := &endpoints.GetWithAllowMultipleQueryParamsRequest{
        Query: []*string{
            fern.String(
                "query",
            ),
        },
        Number: []*int{
            fern.Int(
                1,
            ),
        },
    }
    client.Endpoints.Params.GetWithAllowMultipleQuery(
        context.TODO(),
        request,
    )
}
