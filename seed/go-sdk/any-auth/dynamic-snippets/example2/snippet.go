package example

import (
    context "context"

    client "github.com/any-auth/fern/client"
    option "github.com/any-auth/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    client.User.GetAdmins(
        context.TODO(),
    )
}
