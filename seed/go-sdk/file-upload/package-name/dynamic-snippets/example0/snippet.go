package example

import (
    context "context"
    upload "github.com/fern-api/file-upload-go"
    client "github.com/fern-api/file-upload-go/client"
    option "github.com/fern-api/file-upload-go/option"
    strings "strings"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &upload.JustFileRequest{
        File: strings.NewReader(
            "",
        ),
    }
    client.Service.JustFile(
        context.TODO(),
        request,
    )
}
