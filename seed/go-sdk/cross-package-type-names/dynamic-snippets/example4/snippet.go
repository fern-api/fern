package example

import (
    context "context"

    fern "github.com/cross-package-type-names/fern"
    client "github.com/cross-package-type-names/fern/client"
    option "github.com/cross-package-type-names/fern/option"
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
