package example

import (
    context "context"

    fern "github.com/examples/fern"
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.Type{
        BasicType: fern.BasicTypePrimitive,
    }
    _, err := client.CreateType(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
