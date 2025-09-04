package example

import (
    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
    context "context"
    file "github.com/examples/fern/pleaseinhere/file"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    client.File.Service.GetFile(
        context.TODO(),
        "filename",
        &file.GetFileRequest{
            XFileApiVersion: "X-File-API-Version",
        },
    )
}
