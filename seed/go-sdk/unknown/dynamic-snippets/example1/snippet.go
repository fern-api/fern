package example

import (
    context "context"

    fern "github.com/unknown/fern"
    client "github.com/unknown/fern/client"
    option "github.com/unknown/fern/option"
)

func do() error {
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
    _, err := client.Unknown.PostObject(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
