package example

import (
    client "github.com/unions-with-local-date/fern/client"
    option "github.com/unions-with-local-date/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Bigunion.Get(
        context.TODO(),
        "id",
    )
}
