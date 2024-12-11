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
            Bar: &fern.InlineType1{
                Foo: "foo",
                Bar: &fern.NestedInlineType1{
                    Foo: "foo",
                    Bar: "bar",
                    MyEnum: fern.InlineEnumSunny,
                },
            },
            Foo: "foo",
        },
    )
}
