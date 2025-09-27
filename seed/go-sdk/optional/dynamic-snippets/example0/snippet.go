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
    request := map[string]any{
        "string": map[string]any{
            "key": "value",
        },
    }
    client.Optional.SendOptionalBody(
        context.TODO(),
        request,
    )
}
