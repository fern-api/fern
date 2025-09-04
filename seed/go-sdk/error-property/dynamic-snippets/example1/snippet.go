package example

import (
    client "github.com/error-property/fern/client"
    option "github.com/error-property/fern/option"
    context "context"
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
