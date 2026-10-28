package example

import (
    context "context"

    fern "github.com/multi-url-environment-no-default/fern"
    client "github.com/multi-url-environment-no-default/fern/client"
    option "github.com/multi-url-environment-no-default/fern/option"
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
    request := &fern.GetPresignedURLRequest{
        S3Key: "s3Key",
    }
    _, err := client.S3.GetPresignedURL(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
