package example

import (
    context "context"

    fern "github.com/examples/fern"
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
)

func do() error {
    client := client.NewAcmeClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.RefreshTokenRequest{
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
