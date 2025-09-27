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
    request := &fern.ListResourcesRequest{
        Page: 1,
        PerPage: 1,
        Sort: "created_at",
        Order: "desc",
        IncludeTotals: true,
        Fields: fern.String(
            "fields",
        ),
        Search: fern.String(
            "search",
        ),
    }
    client.Service.ListResources(
        context.TODO(),
        request,
    )
}
