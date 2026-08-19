package example

import (
    context "context"

    client "github.com/endpoint-security-auth/fern/client"
    option "github.com/endpoint-security-auth/fern/option"
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
    client.User.GetWithAnyAuth(
        context.TODO(),
    )
}
