package example

import (
    context "context"

    fern "github.com/client-side-params/fern"
    client "github.com/client-side-params/fern/client"
    option "github.com/client-side-params/fern/option"
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
    request := &fern.ServiceSearchResourcesRequest{
        Limit: 1,
        Offset: 1,
        Query: fern.String(
            "query",
        ),
        Filters: map[string]any{
            "filters": map[string]any{
                "key": "value",
            },
        },
    }
    client.Service.Searchresources(
        context.TODO(),
        request,
    )
}
