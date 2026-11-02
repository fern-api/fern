package example

import (
    context "context"

    client "github.com/oauth-client-credentials-reference/fern/client"
    option "github.com/oauth-client-credentials-reference/fern/option"
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
    err := client.Simple.GetSomething(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
