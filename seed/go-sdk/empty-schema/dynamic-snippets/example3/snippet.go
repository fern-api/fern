package example

import (
    client "github.com/empty-schema/fern/client"
    option "github.com/empty-schema/fern/option"
    fern "github.com/empty-schema/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.AddEntityOverrideRequest{
        MaskedComponent: map[string]any{
            "key": "value",
        },
        OverrideValue: &fern.OverrideValue{
            MaskedComponent: map[string]any{
                "key": "value",
            },
        },
    }
    client.Entities.AddEntity(
        context.TODO(),
        request,
    )
}
