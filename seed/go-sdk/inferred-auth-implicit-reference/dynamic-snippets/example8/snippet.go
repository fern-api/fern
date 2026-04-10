package example

import (
    context "context"

    client "github.com/inferred-auth-implicit-reference/fern/client"
    option "github.com/inferred-auth-implicit-reference/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Simple.Getsomething(
        context.TODO(),
    )
}
