package example

import (
    client "github.com/extends/fern/client"
    option "github.com/extends/fern/option"
    context "context"
    fern "github.com/extends/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.ExtendedInlineRequestBody(
        context.TODO(),
        &fern.Inlined{
            Name: "name",
            Docs: "docs",
            Unique: "unique",
        },
    )
}
