package example

import (
    context "context"

    fern "github.com/content-type/fern"
    client "github.com/content-type/fern/client"
    option "github.com/content-type/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ServiceNamedPatchWithMixedRequest{
        ID: "id",
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
    client.Service.Namedpatchwithmixed(
        context.TODO(),
        request,
    )
}
