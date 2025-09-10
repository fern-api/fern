package example

import (
    client "github.com/audiences/fern/client"
    option "github.com/audiences/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.FolderD.Service.GetDirectThread(
        context.TODO(),
    )
}
