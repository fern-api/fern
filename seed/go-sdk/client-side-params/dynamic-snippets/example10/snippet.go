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
        option.WithToken(
            "<token>",
        ),
    )
    client.Service.ListClients(
        context.TODO(),
        &fern.ListClientsRequest{
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
        },
    )
}
