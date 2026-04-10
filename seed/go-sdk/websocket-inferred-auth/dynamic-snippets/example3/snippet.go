package example

import (
    context "context"

    fern "github.com/websocket-inferred-auth/fern"
    client "github.com/websocket-inferred-auth/fern/client"
    option "github.com/websocket-inferred-auth/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithAPIKey(
            "<X-Api-Key>",
        ),
    )
    request := &fern.AuthRefreshTokenRequest{
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
