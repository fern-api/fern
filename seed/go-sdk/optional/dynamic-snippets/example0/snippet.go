package example

import (
    client "github.com/optional/fern/client"
    option "github.com/optional/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Optional.SendOptionalBody(
        context.TODO(),
        map[string]any{
            "string": map[string]any{
                "key": "value",
            },
        },
    )
}
