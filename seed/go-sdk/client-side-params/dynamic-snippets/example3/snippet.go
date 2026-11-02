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
    _, err := client.Service.ListUsers(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
