package example

import (
    client "github.com/extends/fern/client"
    option "github.com/extends/fern/option"
    fern "github.com/extends/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.Inlined{
        Name: "name",
        Docs: "docs",
        Unique: "unique",
    }
    client.ExtendedInlineRequestBody(
        context.TODO(),
        request,
    )
}
