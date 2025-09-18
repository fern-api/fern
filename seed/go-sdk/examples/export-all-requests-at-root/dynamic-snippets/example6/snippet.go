package example

import (
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
    context "context"
    fern "github.com/examples/fern"
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
        &fern.GetFileRequest{
            XFileApiVersion: "X-File-API-Version",
        },
    )
}
