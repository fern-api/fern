package example

import (
    context "context"
    client "github.com/multi-line-docs/fern/client"
    option "github.com/multi-line-docs/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.User.GetUser(
        context.TODO(),
        "userId",
    )
}
