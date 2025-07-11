package example

import (
    client "github.com/unknown/fern/client"
    option "github.com/unknown/fern/option"
    context "context"
    fern "github.com/unknown/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Unknown.PostObject(
        context.TODO(),
        &fern.MyObject{
            Unknown: map[string]any{
                "key": "value",
            },
        },
    )
}
