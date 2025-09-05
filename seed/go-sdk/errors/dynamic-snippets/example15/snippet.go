package example

import (
    client "github.com/errors/fern/client"
    option "github.com/errors/fern/option"
    context "context"
    fern "github.com/errors/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Simple.FooWithExamples(
        context.TODO(),
        &fern.FooRequest{
            Bar: "bar",
        },
    )
}
