package example

import (
    context "context"

    fern "github.com/exhaustive/fern"
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    types "github.com/exhaustive/fern/types"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &types.ObjectWithMixedRequiredAndOptionalFields{
        RequiredString: "requiredString",
        RequiredInteger: 1,
        OptionalString: fern.String(
            "optionalString",
        ),
        RequiredLong: int64(1000000),
    }
    client.Endpoints.Object.GetAndReturnWithMixedRequiredAndOptionalFields(
        context.TODO(),
        request,
    )
}
