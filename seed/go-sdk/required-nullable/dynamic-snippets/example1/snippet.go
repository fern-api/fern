package example

import (
    context "context"

    fern "github.com/required-nullable/fern"
    client "github.com/required-nullable/fern/client"
    option "github.com/required-nullable/fern/option"
)

func do() error {
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
    _, err := client.GetFoo(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
