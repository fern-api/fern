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
                "just-under-boundary",
            ),
            Integer: fern.Int(
                -2147483649,
            ),
            Double: fern.Float64(
                -2,
            ),
            Bool: fern.Bool(
                true,
            ),
        },
    )
}
