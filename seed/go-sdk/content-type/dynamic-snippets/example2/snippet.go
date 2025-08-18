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
    client.Service.NamedPatchWithMixed(
        context.TODO(),
        "id",
        &fern.NamedMixedPatchRequest{
            AppId: fern.String(
                "appId",
            ),
            Instructions: fern.String(
                "instructions",
            ),
            Active: fern.Bool(
                true,
            ),
        },
    )
}
