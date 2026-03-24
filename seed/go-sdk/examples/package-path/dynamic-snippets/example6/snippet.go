package example

import (
    context "context"

    client "github.com/examples/fern/pleaseinhere/client"
    file "github.com/examples/fern/pleaseinhere/file"
    option "github.com/examples/fern/pleaseinhere/option"
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
    request := &file.GetFileRequest{
        XFileApiVersion: "X-File-API-Version",
    }
    client.File.Service.GetFile(
        context.TODO(),
        "filename",
        request,
    )
}
