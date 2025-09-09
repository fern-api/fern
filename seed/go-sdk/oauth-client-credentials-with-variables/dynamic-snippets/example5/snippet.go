package example

import (
    client "github.com/oauth-client-credentials-with-variables/fern/client"
    option "github.com/oauth-client-credentials-with-variables/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        nil,
    )
    client.Simple.GetSomething(
        context.TODO(),
    )
}
