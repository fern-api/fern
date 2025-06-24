package example

import (
    client "github.com/package-yml/fern/client"
    option "github.com/package-yml/fern/option"
    context "context"
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
