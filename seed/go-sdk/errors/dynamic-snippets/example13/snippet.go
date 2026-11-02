package example

import (
    context "context"

    fern "github.com/errors/fern"
    client "github.com/errors/fern/client"
    option "github.com/errors/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.FooRequest{
        Bar: "bar",
    }
    _, err := client.Simple.FooWithExamples(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
