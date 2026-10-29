package example

import (
    context "context"

    fern "github.com/content-type/fern"
    client "github.com/content-type/fern/client"
    option "github.com/content-type/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.PatchProxyRequest{
        Application: fern.String(
            "application",
        ),
        RequireAuth: fern.Bool(
            true,
        ),
    }
    err := client.Service.Patch(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
