package example

import (
    client "github.com/undiscriminated-union-with-response-property/fern/client"
    option "github.com/undiscriminated-union-with-response-property/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.GetUnion(
        context.TODO(),
    )
}
