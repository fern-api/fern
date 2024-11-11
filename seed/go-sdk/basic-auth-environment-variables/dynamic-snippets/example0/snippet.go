package example

import (
    client "github.com/basic-auth-environment-variables/fern/client"
    option "github.com/basic-auth-environment-variables/fern/option"
    context "context"
)

func do() () {
    client := client.NewClient(
        option.WithBasicAuth(
            "<username>",
            "<password>",
        ),
    )
    client.BasicAuth.GetWithBasicAuth(
        context.TODO(),
    )
}
