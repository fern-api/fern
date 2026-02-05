package example

import (
    client "github.com/endpoint-security-auth/fern/client"
    option "github.com/endpoint-security-auth/fern/option"
    context "context"
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
    client.User.GetWithBearer(
        context.TODO(),
    )
}
