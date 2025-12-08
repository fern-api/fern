package example

import (
    client "github.com/oauth-client-credentials-default/fern/client"
    option "github.com/oauth-client-credentials-default/fern/option"
    core "github.com/oauth-client-credentials-default/fern/core"
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
    client.NestedNoAuth.Api.GetSomething(
        context.TODO(),
    )
}
