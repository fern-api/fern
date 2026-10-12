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
    request := &endpoints.ListItemsRequest{
        Cursor: fern.String(
            "cursor",
        ),
        Limit: fern.Int(
            1,
        ),
    }
    client.Endpoints.Pagination.ListItems(
        context.TODO(),
        request,
    )
}
