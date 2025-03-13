package example

import (
    client "github.com/examples-minimal/fern/client"
    option "github.com/examples-minimal/fern/option"
    context "context"
    fern "github.com/examples-minimal/fern"
)

func do() () {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    client.Service.GetMovie(
        context.TODO(),
        &fern.ExtendedMovie{
            Foo: "foo",
            Bar: 1,
            Cast: []string{
                "cast",
                "cast",
            },
        },
    )
}
