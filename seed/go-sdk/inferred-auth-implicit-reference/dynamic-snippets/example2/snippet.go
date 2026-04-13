package example

import (
    context "context"

    fern "github.com/inferred-auth-implicit-reference/fern"
    client "github.com/inferred-auth-implicit-reference/fern/client"
    option "github.com/inferred-auth-implicit-reference/fern/option"
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
    request := &fern.RefreshTokenRequest{
        ClientID: "client_id",
        ClientSecret: "client_secret",
        RefreshToken: "refresh_token",
        Audience: fern.RefreshTokenRequestAudienceHttpsApiExampleCom,
        GrantType: fern.RefreshTokenRequestGrantTypeRefreshToken,
    }
    client.Auth.Refreshtoken(
        context.TODO(),
        request,
    )
}
