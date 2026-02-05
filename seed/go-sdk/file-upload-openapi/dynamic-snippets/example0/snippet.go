package example

import (
    client "github.com/file-upload-openapi/fern/client"
    option "github.com/file-upload-openapi/fern/option"
    fern "github.com/file-upload-openapi/fern"
    strings "strings"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UploadFileRequest{
        File: strings.NewReader(
            "",
        ),
        Name: "name",
    }
    client.FileUploadExample.UploadFile(
        context.TODO(),
        request,
    )
}
