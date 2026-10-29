package example

import (
    context "context"

    fern "github.com/exhaustive/fern"
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    types "github.com/exhaustive/fern/types"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &types.ObjectWithMixedRequiredAndOptionalFields{
        RequiredString: "hello",
        RequiredInteger: 0,
        OptionalString: fern.String(
            "world",
        ),
        RequiredLong: int64(0),
    }
    _, err := client.Endpoints.Object.GetAndReturnWithMixedRequiredAndOptionalFields(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
