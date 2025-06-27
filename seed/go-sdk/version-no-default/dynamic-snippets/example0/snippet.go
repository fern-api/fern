package example

import (
    client "github.com/version-no-default/fern/client"
    option "github.com/version-no-default/fern/option"
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
