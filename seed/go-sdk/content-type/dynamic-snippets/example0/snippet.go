package example

import (
    client "github.com/content-type/fern/client"
    option "github.com/content-type/fern/option"
    context "context"
    fern "github.com/content-type/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.Patch(
        context.TODO(),
        &fern.PatchProxyRequest{
            Application: fern.String(
                "application",
            ),
            RequireAuth: fern.Bool(
                true,
            ),
        },
    )
}
