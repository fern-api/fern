package example

import (
    context "context"

    client "github.com/examples/fern/client"
    file "github.com/examples/fern/file"
    option "github.com/examples/fern/option"
)

func do() error {
    client := client.New(
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
