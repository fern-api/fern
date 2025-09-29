package example

import (
    client "github.com/unknown/fern/client"
    option "github.com/unknown/fern/option"
    fern "github.com/unknown/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.MyObject{
        Unknown: map[string]any{
            "key": "value",
        },
    }
    client.Unknown.PostObject(
        context.TODO(),
        request,
    )
}
