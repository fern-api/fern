package example

import (
    context "context"

    fern "github.com/client-side-params/fern"
    client "github.com/client-side-params/fern/client"
    option "github.com/client-side-params/fern/option"
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
    _, err := client.Service.SearchResources(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
