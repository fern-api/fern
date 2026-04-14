package example

import (
    context "context"

    client "github.com/cross-package-type-names/fern/client"
    option "github.com/cross-package-type-names/fern/option"
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
