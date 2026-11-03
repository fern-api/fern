package example

import (
    context "context"

    client "github.com/oauth-client-credentials-with-variables/fern/client"
    option "github.com/oauth-client-credentials-with-variables/fern/option"
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
        option.WithRootVariable(
            "<endpointParam>",
        ),
    )
    err := client.Service.Post(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
