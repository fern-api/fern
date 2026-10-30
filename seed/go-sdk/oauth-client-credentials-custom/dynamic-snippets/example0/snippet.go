package example

import (
    context "context"

    fern "github.com/oauth-client-credentials-custom/fern"
    client "github.com/oauth-client-credentials-custom/fern/client"
    option "github.com/oauth-client-credentials-custom/fern/option"
)

func do() error {
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
        EntityID: "entity_id",
        Scope: fern.String(
            "scope",
        ),
        Permissions: []string{
            "permissions",
            "permissions",
        },
    }
    _, err := client.Auth.GetTokenWithClientCredentials(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
