package example

import (
    context "context"

    client "github.com/audiences/fern/client"
    option "github.com/audiences/fern/option"
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
