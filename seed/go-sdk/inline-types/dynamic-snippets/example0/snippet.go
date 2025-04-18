package example

import (
    client "github.com/inline-types/fern/client"
    context "context"
    fern "github.com/inline-types/fern"
)

func do() () {
    client := client.NewClient()
    client.GetRoot(
        context.TODO(),
        &fern.PostRootRequest{
            Bar: &fern.RequestTypeInlineType1{
                Foo: "foo",
            },
            Foo: "foo",
        },
    )
}
