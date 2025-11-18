package example

import (
    client "github.com/fern-api/file-upload-go/client"
    option "github.com/fern-api/file-upload-go/option"
    upload "github.com/fern-api/file-upload-go"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &upload.OptionalArgsRequest{}
    client.Service.OptionalArgs(
        context.TODO(),
        request,
    )
}
