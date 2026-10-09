package example

import (
    context "context"

    fern "github.com/alias-extends/fern"
    client "github.com/alias-extends/fern/client"
    option "github.com/alias-extends/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.InlinedChildRequest{
        Parent: "parent",
        Child: "child",
    }
    client.ExtendedInlineRequestBody(
        context.TODO(),
        request,
    )
}
