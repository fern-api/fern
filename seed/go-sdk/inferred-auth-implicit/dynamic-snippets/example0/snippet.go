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
    request := &fern.AuthGetTokenWithClientCredentialsRequest{
        APIKey: "X-Api-Key",
        ClientID: "client_id",
        ClientSecret: "client_secret",
        Audience: fern.AuthGetTokenWithClientCredentialsRequestAudienceHttpsApiExampleCom,
        GrantType: fern.AuthGetTokenWithClientCredentialsRequestGrantTypeClientCredentials,
    }
    client.Auth.Gettokenwithclientcredentials(
        context.TODO(),
        request,
    )
}
