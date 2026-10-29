package example

import (
    context "context"

    client "github.com/package-yml/fern/client"
    option "github.com/package-yml/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    err := client.Service.Nop(
        context.TODO(),
        "id",
        "nestedId",
    )
    if err != nil {
        return err
    }
    return nil
}
