package example

import (
    client "github.com/go-deterministic-ordering/fern/client"
    option "github.com/go-deterministic-ordering/fern/option"
    types "github.com/go-deterministic-ordering/fern/types"
    context "context"
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
    request := &types.ObjectWithUnknownField{
        Unknown: map[string]any{
            "$ref": "https://example.com/schema",
        },
    }
    client.Endpoints.Object.GetAndReturnWithUnknownField(
        context.TODO(),
        request,
    )
}
