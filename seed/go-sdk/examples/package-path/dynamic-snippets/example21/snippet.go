package example

import (
    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
    context "context"
    pleaseinhere "github.com/examples/fern/pleaseinhere"
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
    client.Service.RefreshToken(
        context.TODO(),
        &pleaseinhere.RefreshTokenRequest{
            Ttl: 420,
        },
    )
}
