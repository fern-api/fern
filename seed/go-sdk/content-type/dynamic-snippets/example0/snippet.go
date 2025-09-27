package example

import (
    client "github.com/content-type/fern/client"
    option "github.com/content-type/fern/option"
    fern "github.com/content-type/fern"
    context "context"
)

func do() {
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
    client.Service.Patch(
        context.TODO(),
        request,
    )
}
