package example

import (
    context "context"
    fern "github.com/multi-url-environment/fern"
    client "github.com/multi-url-environment/fern/client"
    option "github.com/multi-url-environment/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.GetPresignedUrlRequest{
        S3Key: "s3Key",
    }
    client.S3.GetPresignedUrl(
        context.TODO(),
        request,
    )
}
