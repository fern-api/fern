package example

import (
    client "github.com/client-side-params/fern/client"
    option "github.com/client-side-params/fern/option"
    fern "github.com/client-side-params/fern"
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
    request := &fern.SearchResourcesRequest{
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
    client.Service.SearchResources(
        context.TODO(),
        request,
    )
}
