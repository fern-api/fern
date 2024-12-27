package example

import (
    client "github.com/inline-types/fern/client"
    context "context"
    fern "github.com/inline-types/fern"
)

func do() () {
    client := client.NewClient()
    client.GetUndiscriminatedUnion(
        context.TODO(),
        &fern.GetUndiscriminatedUnionRequest{
            Bar: &fern.UndiscriminatedUnion1{
                UndiscriminatedUnion1InlineType1: &fern.UndiscriminatedUnion1InlineType1{
                    Foo: "foo",
                    Bar: &fern.UndiscriminatedUnion1InlineType1InlineType1{
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
