package example

import (
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    context "context"
    types "github.com/exhaustive/fern/types"
    fern "github.com/exhaustive/fern"
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
    client.Endpoints.Object.TestIntegerOverflowEdgeCases(
        context.TODO(),
        &types.ObjectWithOptionalField{
            String: fern.String(
                "large-positive",
            ),
            Integer: fern.Int(
                1000000000000,
            ),
            Double: fern.Float64(
                1000000000000,
            ),
            Bool: fern.Bool(
                false,
            ),
        },
    )
}
