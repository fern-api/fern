package example

import (
    client "github.com/oauth-client-credentials-environment-variables/fern/client"
    option "github.com/oauth-client-credentials-environment-variables/fern/option"
    core "github.com/oauth-client-credentials-environment-variables/fern/core"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithOAuthTokenProvider(
            core.NewOAuthTokenProvider(
                "<clientId>",
                "<clientSecret>",
                nil,
            ),
        ),
    )
    client.Nested.Api.GetSomething(
        context.TODO(),
    )
}
