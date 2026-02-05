package example

import (
    client "github.com/no-retries/fern/client"
    option "github.com/no-retries/fern/option"
    context "context"
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
