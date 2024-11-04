package example

import (
    client "github.com/auth-environment-variables/fern/client"
    option "github.com/auth-environment-variables/fern/option"
    context "context"
)

func do() () {
    client := client.NewClient(
        option.WithApiKey(
            "<value>",
        ),
    )
    client.Service.GetWithApiKey(
        context.TODO(),
    )
}
