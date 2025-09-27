package example

import (
    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
    file "github.com/examples/fern/pleaseinhere/file"
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
    request := &file.GetFileRequest{
        XFileApiVersion: "0.0.2",
    }
    client.File.Service.GetFile(
        context.TODO(),
        "file.txt",
        request,
    )
}
