package example

import (
    client "github.com/unknown/fern/client"
    option "github.com/unknown/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := map[string]any{
        "key": "value",
    }
    client.Unknown.Post(
        context.TODO(),
        request,
    )
}
