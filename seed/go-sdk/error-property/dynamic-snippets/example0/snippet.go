package example

import (
    context "context"

    client "github.com/error-property/fern/client"
    option "github.com/error-property/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.PropertyBasedError.ThrowError(
        context.TODO(),
    )
}
