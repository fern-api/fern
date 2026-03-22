package example

import (
    context "context"
    client "github.com/package-yml/fern/client"
    option "github.com/package-yml/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.Nop(
        context.TODO(),
        "id",
        "nestedId",
    )
}
