package example

import (
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
    context "context"
    file "github.com/examples/fern/file"
)

func do() {
    client := client.NewAcme(
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
