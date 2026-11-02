package example

import (
    context "context"

    fern "github.com/oauth-client-credentials-custom-prefix-openapi/fern"
    client "github.com/oauth-client-credentials-custom-prefix-openapi/fern/client"
    option "github.com/oauth-client-credentials-custom-prefix-openapi/fern/option"
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
    request := &fern.GetTokenIdentityRequest{
        Username: "username",
        Password: "password",
    }
    _, err := client.Identity.GetToken(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
