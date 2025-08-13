package example

import (
    client "github.com/client-side-params/fern/client"
    option "github.com/client-side-params/fern/option"
    context "context"
    fern "github.com/client-side-params/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.SearchResources(
        context.TODO(),
        &fern.SearchResourcesRequest{
            Limit: 1,
            Offset: 1,
            Query: "query",
            Filters: map[string]any{
                "filters": map[string]any{
                    "key": "value",
                },
            },
        },
    )
}
