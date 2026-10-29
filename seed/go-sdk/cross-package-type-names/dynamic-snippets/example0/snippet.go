package example

import (
    context "context"

    client "github.com/cross-package-type-names/fern/client"
    option "github.com/cross-package-type-names/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.FolderA.Service.GetDirectThread(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
