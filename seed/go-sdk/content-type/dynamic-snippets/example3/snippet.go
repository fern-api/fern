package example

import (
    client "github.com/content-type/fern/client"
    option "github.com/content-type/fern/option"
    context "context"
    fern "github.com/content-type/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.OptionalMergePatchTest(
        context.TODO(),
        &fern.OptionalMergePatchRequest{
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
        },
    )
}
