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
        option.WithClientCredentials(
            "<clientId>",
            "<clientSecret>",
        ),
    )
    request := &fern.GetTokenRequest{
        Cid: "cid",
        Csr: "csr",
        Scp: "scp",
        EntityId: "entity_id",
        Scope: fern.String(
            "scope",
        ),
    }
    client.Auth.GetTokenWithClientCredentials(
        context.TODO(),
        request,
    )
}
