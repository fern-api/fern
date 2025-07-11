package example

import (
    client "github.com/folders/fern/client"
    option "github.com/folders/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Foo(
        context.TODO(),
    )
}
