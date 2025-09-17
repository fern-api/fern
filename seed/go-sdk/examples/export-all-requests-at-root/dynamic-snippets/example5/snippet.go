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
        "file.txt",
        &fern.GetFileRequest{
            XFileApiVersion: "0.0.2",
        },
    )
}
