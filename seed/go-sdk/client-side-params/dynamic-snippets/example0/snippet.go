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
    request := &fern.ServiceListResourcesRequest{
        Page: 1,
        PerPage: 1,
        Sort: "sort",
        Order: "order",
        IncludeTotals: true,
    }
    client.Service.Listresources(
        context.TODO(),
        request,
    )
}
