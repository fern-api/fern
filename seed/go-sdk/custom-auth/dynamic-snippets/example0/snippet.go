package example

import (
    client "github.com/custom-auth/fern/client"
    option "github.com/custom-auth/fern/option"
    context "context"
)

func do() () {
    client := client.NewClient(
        option.WithCustomAuthScheme(
            "<value>",
        ),
    )
    client.CustomAuth.GetWithCustomAuth(
        context.TODO(),
    )
}
