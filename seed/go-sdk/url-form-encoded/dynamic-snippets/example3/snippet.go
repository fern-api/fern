package example

import (
    client "github.com/url-form-encoded/fern/client"
    option "github.com/url-form-encoded/fern/option"
    fern "github.com/url-form-encoded/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.TokenRequest{
        ClientId: "client_id",
        ClientSecret: "client_secret",
    }
    client.GetToken(
        context.TODO(),
        request,
    )
}
