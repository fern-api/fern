package example

import (
    context "context"

    fern "github.com/examples/fern"
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
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
    request := &fern.GetFileRequest{
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
