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
    request := &fern.ListUsersRequest{
        Page: fern.Int(
            1,
        ),
        PerPage: fern.Int(
            1,
        ),
        IncludeTotals: fern.Bool(
            true,
        ),
        Sort: fern.String(
            "sort",
        ),
        Connection: fern.String(
            "connection",
        ),
        Q: fern.String(
            "q",
        ),
        SearchEngine: fern.String(
            "search_engine",
        ),
        Fields: fern.String(
            "fields",
        ),
    }
    client.Service.ListUsers(
        context.TODO(),
        request,
    )
}
