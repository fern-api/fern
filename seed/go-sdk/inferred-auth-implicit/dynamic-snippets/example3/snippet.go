package example

import (
    context "context"

    fern "github.com/inferred-auth-implicit/fern"
    client "github.com/inferred-auth-implicit/fern/client"
    option "github.com/inferred-auth-implicit/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.AuthRefreshTokenRequest{
        APIKey: "apiKey",
        ClientID: "client_id",
        ClientSecret: "client_secret",
        RefreshToken: "refresh_token",
        Audience: fern.AuthRefreshTokenRequestAudienceHttpsApiExampleCom,
        GrantType: fern.AuthRefreshTokenRequestGrantTypeRefreshToken,
        Scope: fern.String(
            "scope",
        ),
    }
    client.Auth.Refreshtoken(
        context.TODO(),
        request,
    )
}
