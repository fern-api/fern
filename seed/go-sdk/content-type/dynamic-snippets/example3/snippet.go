package example

import (
    context "context"

    fern "github.com/content-type/fern"
    client "github.com/content-type/fern/client"
    option "github.com/content-type/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.OptionalMergePatchRequest{
        RequiredField: "requiredField",
        OptionalString: fern.String(
            "optionalString",
        ),
        OptionalInteger: fern.Int(
            1,
        ),
        OptionalBoolean: fern.Bool(
            true,
        ),
        NullableString: fern.String(
            "nullableString",
        ),
    }
    err := client.Service.OptionalMergePatchTest(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
