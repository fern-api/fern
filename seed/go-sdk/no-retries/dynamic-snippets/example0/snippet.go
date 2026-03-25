package example

import (
    context "context"

    client "github.com/no-retries/fern/client"
    option "github.com/no-retries/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Retries.GetUsers(
        context.TODO(),
    )
}
