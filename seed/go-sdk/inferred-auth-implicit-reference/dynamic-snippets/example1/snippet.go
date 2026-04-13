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
    request := &fern.GetTokenRequest{
        ClientID: "client_id",
        ClientSecret: "client_secret",
        Audience: fern.GetTokenRequestAudienceHttpsApiExampleCom,
        GrantType: fern.GetTokenRequestGrantTypeClientCredentials,
        Scope: fern.String(
            "scope",
        ),
    }
    client.Auth.Gettokenwithclientcredentials(
        context.TODO(),
        request,
    )
}
