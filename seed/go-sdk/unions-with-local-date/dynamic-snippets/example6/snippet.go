package example

import (
    context "context"

    fern "github.com/unions-with-local-date/fern"
    client "github.com/unions-with-local-date/fern/client"
    option "github.com/unions-with-local-date/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UnionWithTime{}
    _, err := client.Types.Update(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
