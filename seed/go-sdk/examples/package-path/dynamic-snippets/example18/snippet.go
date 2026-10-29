package example

import (
    context "context"

    pleaseinhere "github.com/examples/fern/pleaseinhere"
    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &pleaseinhere.GetMetadataRequest{
        Shallow: pleaseinhere.Bool(
            true,
        ),
        Tag: []*string{
            pleaseinhere.String(
                "tag",
            ),
        },
        XAPIVersion: "X-API-Version",
    }
    _, err := client.Service.GetMetadata(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
