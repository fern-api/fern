package example

import (
    context "context"

    fern "github.com/go-required-nullable-round-trip/fern"
    client "github.com/go-required-nullable-round-trip/fern/client"
    option "github.com/go-required-nullable-round-trip/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetAccountsRequest{
        AccessToken: "access_token",
        AccountIDs: []string{
            "account_ids",
            "account_ids",
        },
    }
    client.GetAccounts(
        context.TODO(),
        request,
    )
}
