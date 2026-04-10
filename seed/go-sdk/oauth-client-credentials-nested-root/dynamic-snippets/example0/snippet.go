package example

import (
    context "context"

    fern "github.com/oauth-client-credentials-nested-root/fern"
    client "github.com/oauth-client-credentials-nested-root/fern/client"
    option "github.com/oauth-client-credentials-nested-root/fern/option"
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
    request := &fern.AuthGetTokenRequest{
        ClientID: "client_id",
        ClientSecret: "client_secret",
        Audience: fern.AuthGetTokenRequestAudienceHttpsApiExampleCom,
        GrantType: fern.AuthGetTokenRequestGrantTypeClientCredentials,
    }
    client.Auth.Gettoken(
        context.TODO(),
        request,
    )
}
