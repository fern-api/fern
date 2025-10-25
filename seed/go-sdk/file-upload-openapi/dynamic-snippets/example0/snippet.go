package example

import (
    client "github.com/file-upload-openapi/fern/client"
    option "github.com/file-upload-openapi/fern/option"
    fern "github.com/file-upload-openapi/fern"
    context "context"
    strings "strings"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UploadFileRequest{
        Name: "name",
    }
    client.FileUploadExample.UploadFile(
        context.TODO(),
        strings.NewReader(
            "",
        ),
        request,
    )
}
