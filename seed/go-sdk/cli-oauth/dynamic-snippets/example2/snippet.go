package example

import (
    context "context"

    fern "github.com/cli-oauth/fern"
    client "github.com/cli-oauth/fern/client"
    option "github.com/cli-oauth/fern/option"
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
    request := &fern.RefreshTokenAuthRequest{
        RefreshToken: "refresh_token",
        GrantType: fern.RefreshTokenAuthRequestGrantTypeRefreshToken,
    }
    client.Auth.RefreshToken(
        context.TODO(),
        request,
    )
}
