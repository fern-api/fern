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
    request := &fern.AuthGetTokenWithClientCredentialsRequest{
        ClientID: "client_id",
        ClientSecret: "client_secret",
        Audience: fern.AuthGetTokenWithClientCredentialsRequestAudienceHttpsApiExampleCom,
        GrantType: fern.AuthGetTokenWithClientCredentialsRequestGrantTypeClientCredentials,
        Scope: fern.String(
            "scope",
        ),
    }
    client.Auth.Gettokenwithclientcredentials(
        context.TODO(),
        request,
    )
}
