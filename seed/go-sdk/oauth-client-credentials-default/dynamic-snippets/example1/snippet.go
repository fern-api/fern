package example

import (
    client "github.com/oauth-client-credentials-default/fern/client"
    option "github.com/oauth-client-credentials-default/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.NestedNoAuth.Api.GetSomething(
        context.TODO(),
    )
}
