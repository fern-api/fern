package example

import (
    client "github.com/required-nullable/fern/client"
    option "github.com/required-nullable/fern/option"
    fern "github.com/required-nullable/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetFooRequest{
        OptionalBaz: fern.String(
            "optional_baz",
        ),
        OptionalNullableBaz: fern.String(
            "optional_nullable_baz",
        ),
        RequiredBaz: "required_baz",
        RequiredNullableBaz: fern.String(
            "required_nullable_baz",
        ),
    }
    client.GetFoo(
        context.TODO(),
        request,
    )
}
