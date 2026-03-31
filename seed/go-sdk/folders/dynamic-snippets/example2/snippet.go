package example

import (
    context "context"

    client "github.com/folders/fern/client"
    option "github.com/folders/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.A.C.Foo(
        context.TODO(),
    )
}
