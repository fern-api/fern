package example

import (
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
    fern "github.com/examples/fern"
    context "context"
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
    request := &fern.GetFileRequest{
        XFileApiVersion: "X-File-API-Version",
    }
    client.File.Service.GetFile(
        context.TODO(),
        "filename",
        request,
    )
}
