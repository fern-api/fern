package example

import (
    context "context"

    fern "github.com/oauth-client-credentials-nested-root/fern"
    auth "github.com/oauth-client-credentials-nested-root/fern/auth"
    client "github.com/oauth-client-credentials-nested-root/fern/client"
    option "github.com/oauth-client-credentials-nested-root/fern/option"
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
    request := &auth.GetTokenRequest{
        ClientID: "client_id",
        ClientSecret: "client_secret",
        Scope: fern.String(
            "scope",
        ),
    }
    _, err := client.Auth.GetToken(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
