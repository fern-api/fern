package example

import (
    context "context"

    client "github.com/openapi-per-spec-base-path/fern/client"
    oauth "github.com/openapi-per-spec-base-path/fern/oauth"
    option "github.com/openapi-per-spec-base-path/fern/option"
)

func do() {
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
    client.Oauth.GetToken(
        context.TODO(),
        request,
    )
}
