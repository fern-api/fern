package example

import (
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
    file "github.com/examples/fern/file"
    context "context"
)

func do() {
    client := client.NewAcmeClient(
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
