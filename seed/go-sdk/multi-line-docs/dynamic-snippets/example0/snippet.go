package example

import (
    client "github.com/multi-line-docs/fern/client"
    option "github.com/multi-line-docs/fern/option"
    context "context"
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
