package example

import (
    context "context"

    fern "github.com/extends/fern"
    client "github.com/extends/fern/client"
    option "github.com/extends/fern/option"
)

func do() error {
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
    err := client.ExtendedInlineRequestBody(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
