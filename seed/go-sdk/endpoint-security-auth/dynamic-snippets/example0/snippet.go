package example

import (
    context "context"

    fern "github.com/endpoint-security-auth/fern"
    client "github.com/endpoint-security-auth/fern/client"
    option "github.com/endpoint-security-auth/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
        option.WithAPIKey(
            "<X-API-Key>",
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
