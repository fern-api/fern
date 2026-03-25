package example

import (
    context "context"

    fern "github.com/content-type/fern"
    client "github.com/content-type/fern/client"
    option "github.com/content-type/fern/option"
)

func do() {
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
    client.Service.OptionalMergePatchTest(
        context.TODO(),
        request,
    )
}
