package example

import (
    context "context"

    fern "github.com/oauth-client-credentials-environment-variables/fern"
    client "github.com/oauth-client-credentials-environment-variables/fern/client"
    option "github.com/oauth-client-credentials-environment-variables/fern/option"
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
    request := &fern.AuthGetTokenWithClientCredentialsRequest{
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
