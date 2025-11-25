package example

import (
    client "github.com/unions-with-local-date/fern/client"
    option "github.com/unions-with-local-date/fern/option"
    fern "github.com/unions-with-local-date/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UnionWithTime{
        Value: 1,
    }
    client.Types.Update(
        context.TODO(),
        request,
    )
}
