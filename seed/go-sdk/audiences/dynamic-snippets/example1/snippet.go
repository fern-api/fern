package example

import (
    context "context"

    fern "github.com/audiences/fern"
    client "github.com/audiences/fern/client"
    option "github.com/audiences/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.FooFindRequest{}
    client.Foo.Find(
        context.TODO(),
        request,
    )
}
