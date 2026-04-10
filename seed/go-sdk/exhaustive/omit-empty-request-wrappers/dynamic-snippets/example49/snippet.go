package example

import (
    context "context"

    fern "github.com/exhaustive/fern"
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
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
    request := &fern.TypesObjectWithMixedRequiredAndOptionalFields{
        RequiredString: "requiredString",
        RequiredInteger: 1,
        OptionalString: fern.String(
            "optionalString",
        ),
        RequiredLong: int64(1000000),
    }
    client.EndpointsObject.EndpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields(
        context.TODO(),
        request,
    )
}
