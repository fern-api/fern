package example

import (
    context "context"
    strings "strings"

    upload "github.com/fern-api/file-upload-go"
    client "github.com/fern-api/file-upload-go/client"
    option "github.com/fern-api/file-upload-go/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &upload.OptionalArgsRequest{
        ImageFile: strings.NewReader(
            "",
        ),
    }
    _, err := client.Service.OptionalArgs(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
