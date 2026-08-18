package example

import (
    context "context"

    client "github.com/go-additional-acronyms/fern/client"
    option "github.com/go-additional-acronyms/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.FDX.ListAccounts(
        context.TODO(),
    )
}
