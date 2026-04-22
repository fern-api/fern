package example

import (
    context "context"

    fern "github.com/errors/fern"
    client "github.com/errors/fern/client"
    option "github.com/errors/fern/option"
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
    client.Simple.Foo(
        context.TODO(),
        request,
    )
}
