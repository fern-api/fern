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
    request := &fern.ListClientsRequest{
        Fields: fern.String(
            "fields",
        ),
        IncludeFields: fern.Bool(
            true,
        ),
        Page: fern.Int(
            1,
        ),
        PerPage: fern.Int(
            1,
        ),
        IncludeTotals: fern.Bool(
            true,
        ),
        IsGlobal: fern.Bool(
            true,
        ),
        IsFirstParty: fern.Bool(
            true,
        ),
        AppType: []string{
            "app_type",
            "app_type",
        },
    }
    client.Service.ListClients(
        context.TODO(),
        request,
    )
}
