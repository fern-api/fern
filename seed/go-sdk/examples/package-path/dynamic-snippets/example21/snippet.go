package example

import (
    context "context"
    pleaseinhere "github.com/examples/fern/pleaseinhere"
    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
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
    request := &pleaseinhere.RefreshTokenRequest{
        Ttl: 420,
    }
    client.Service.RefreshToken(
        context.TODO(),
        request,
    )
}
