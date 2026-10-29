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
    request := &fern.NamedMixedPatchRequest{
        AppID: fern.String(
            "appId",
        ),
        Instructions: fern.String(
            "instructions",
        ),
        Active: fern.Bool(
            true,
        ),
    }
    err := client.Service.NamedPatchWithMixed(
        context.TODO(),
        "id",
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
