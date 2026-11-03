package example

import (
    context "context"

    fern "github.com/examples/fern"
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
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
    request := &fern.GetMetadataRequest{
        Shallow: fern.Bool(
            false,
        ),
        Tag: []*string{
            fern.String(
                "development",
            ),
        },
        XAPIVersion: "0.0.1",
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
