package example

import (
    context "context"

    fern "github.com/inferred-auth-explicit/fern"
    client "github.com/inferred-auth-explicit/fern/client"
    option "github.com/inferred-auth-explicit/fern/option"
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
