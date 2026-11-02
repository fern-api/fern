package example

import (
    context "context"

    client "github.com/folders/fern/client"
    option "github.com/folders/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := map[string]any{
        "key": "value",
    }
    err := client.Folder.Service.UnknownRequest(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
