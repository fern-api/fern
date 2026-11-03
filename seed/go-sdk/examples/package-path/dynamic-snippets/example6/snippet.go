package example

import (
    context "context"

    client "github.com/examples/fern/pleaseinhere/client"
    file "github.com/examples/fern/pleaseinhere/file"
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
    request := &file.GetFileRequest{
        XFileAPIVersion: "X-File-API-Version",
    }
    _, err := client.File.Service.GetFile(
        context.TODO(),
        "filename",
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
