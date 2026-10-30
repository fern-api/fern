package example

import (
    context "context"

    client "github.com/openapi-per-spec-base-path-disabled/fern/client"
    oauth "github.com/openapi-per-spec-base-path-disabled/fern/oauth"
    option "github.com/openapi-per-spec-base-path-disabled/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithClientCredentials(
            "<clientId>",
            "<clientSecret>",
        ),
    )
    request := &oauth.GetTokenRequest{
        ClientID: "client_id",
        ClientSecret: "client_secret",
    }
    _, err := client.Oauth.GetToken(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
