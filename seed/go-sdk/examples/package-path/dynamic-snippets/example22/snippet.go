package example

import (
    context "context"

    pleaseinhere "github.com/examples/fern/pleaseinhere"
    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &pleaseinhere.RefreshTokenRequest{
        TTL: 1,
    }
    err := client.Service.RefreshToken(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
