package example

import (
    context "context"

    fern "github.com/required-nullable/fern"
    client "github.com/required-nullable/fern/client"
    option "github.com/required-nullable/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetFooRequest{
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
