package example

import (
    client "github.com/oauth-client-credentials-nested-root/fern/client"
    option "github.com/oauth-client-credentials-nested-root/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Simple.GetSomething(
        context.TODO(),
    )
}
