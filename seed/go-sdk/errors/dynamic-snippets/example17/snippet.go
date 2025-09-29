package example

import (
    client "github.com/errors/fern/client"
    option "github.com/errors/fern/option"
    fern "github.com/errors/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.FooRequest{
        Bar: "bar",
    }
    client.Simple.FooWithExamples(
        context.TODO(),
        request,
    )
}
