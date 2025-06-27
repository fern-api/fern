package example

import (
    client "github.com/oauth-client-credentials-custom/fern/client"
    option "github.com/oauth-client-credentials-custom/fern/option"
    context "context"
    fern "github.com/oauth-client-credentials-custom/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Auth.GetTokenWithClientCredentials(
        context.TODO(),
        &fern.GetTokenRequest{
            Cid: "cid",
            Csr: "csr",
            Scp: "scp",
            EntityId: "entity_id",
            Scope: fern.String(
                "scope",
            ),
        },
    )
}
