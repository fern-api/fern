package example

import (
    context "context"

    client "github.com/inferred-auth-implicit-api-key/fern/client"
    option "github.com/inferred-auth-implicit-api-key/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithAPIKey(
            "X-Api-Key",
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
