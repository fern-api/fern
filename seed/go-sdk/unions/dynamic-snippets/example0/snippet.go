package example

import (
    client "github.com/fern-api/unions-go/client"
    option "github.com/fern-api/unions-go/option"
    context "context"
)

func do() () {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Union.Get(
        context.TODO(),
        "id",
    )
}
