package example

import (
    context "context"

    client "github.com/examples/fern/client"
    file "github.com/examples/fern/file"
    option "github.com/examples/fern/option"
)

func do() error {
    client := client.NewAcme(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &file.GetFileRequest{
        XFileAPIVersion: "0.0.2",
    }
    _, err := client.File.Service.GetFile(
        context.TODO(),
        "file.txt",
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
