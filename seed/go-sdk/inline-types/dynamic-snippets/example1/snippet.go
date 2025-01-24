package example

import (
    client "github.com/inline-types/fern/client"
    context "context"
    fern "github.com/inline-types/fern"
)

func do() () {
    client := client.NewClient()
    client.GetDiscriminatedUnion(
        context.TODO(),
        &fern.GetDiscriminatedUnionRequest{
            Bar: &fern.DiscriminatedUnion1{
                Type1: &fern.DiscriminatedUnion1InlineType1{
                    Foo: "foo",
                    Bar: &fern.DiscriminatedUnion1InlineType1InlineType1{
                        Foo: "foo",
                        Ref: &fern.ReferenceType{
                            Foo: "foo",
                        },
                    },
                    Ref: &fern.ReferenceType{
                        Foo: "foo",
                    },
                },
            },
            Foo: "foo",
        },
    )
}
