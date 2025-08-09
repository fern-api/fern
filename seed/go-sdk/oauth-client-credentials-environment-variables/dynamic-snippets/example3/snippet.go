package example

import (
    client "github.com/oauth-client-credentials-environment-variables/fern/client"
    option "github.com/oauth-client-credentials-environment-variables/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Nested.Api.GetSomething(
        context.TODO(),
    )
}
