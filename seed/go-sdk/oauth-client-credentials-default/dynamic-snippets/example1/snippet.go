package example

import (
    context "context"

    client "github.com/oauth-client-credentials-default/fern/client"
    option "github.com/oauth-client-credentials-default/fern/option"
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
    err := client.NestedNoAuth.API.GetSomething(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
