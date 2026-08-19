package example

import (
    context "context"

    client "github.com/version/fern/client"
    option "github.com/version/fern/option"
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
