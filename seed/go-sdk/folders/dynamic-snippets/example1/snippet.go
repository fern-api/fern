package example

import (
    context "context"

    client "github.com/folders/fern/client"
    option "github.com/folders/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    err := client.A.B.Foo(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
