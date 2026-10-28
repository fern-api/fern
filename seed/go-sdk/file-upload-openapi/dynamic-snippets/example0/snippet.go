package example

import (
    context "context"
    strings "strings"

    fern "github.com/file-upload-openapi/fern"
    client "github.com/file-upload-openapi/fern/client"
    option "github.com/file-upload-openapi/fern/option"
)

func do() error {
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
    _, err := client.FileUploadExample.UploadFile(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
