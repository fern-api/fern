package example

import (
    context "context"
    client "github.com/undiscriminated-union-with-response-property/fern/client"
    option "github.com/undiscriminated-union-with-response-property/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.ListUnions(
        context.TODO(),
    )
}
