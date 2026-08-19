package example

import (
    context "context"

    fern "github.com/oauth-client-credentials-openapi/fern"
    client "github.com/oauth-client-credentials-openapi/fern/client"
    option "github.com/oauth-client-credentials-openapi/fern/option"
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
    request := &fern.GetTokenIdentityRequest{
        Username: "username",
        Password: "password",
    }
    client.Identity.GetToken(
        context.TODO(),
        request,
    )
}
