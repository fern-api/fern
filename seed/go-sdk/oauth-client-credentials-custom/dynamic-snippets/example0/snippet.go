package example

import (
    context "context"

    fern "github.com/oauth-client-credentials-custom/fern"
    client "github.com/oauth-client-credentials-custom/fern/client"
    option "github.com/oauth-client-credentials-custom/fern/option"
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
        Cid: "cid",
        Csr: "csr",
        Scp: "scp",
        EntityID: "entity_id",
        Audience: fern.AuthGetTokenWithClientCredentialsRequestAudienceHttpsApiExampleCom,
        GrantType: fern.AuthGetTokenWithClientCredentialsRequestGrantTypeClientCredentials,
    }
    client.Auth.Gettokenwithclientcredentials(
        context.TODO(),
        request,
    )
}
