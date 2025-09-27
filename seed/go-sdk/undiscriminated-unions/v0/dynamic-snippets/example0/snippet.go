package example

import (
    client "github.com/undiscriminated-unions/fern/client"
    option "github.com/undiscriminated-unions/fern/option"
    fern "github.com/undiscriminated-unions/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.MyUnion{
        String: "string",
    }
    client.Union.Get(
        context.TODO(),
        request,
    )
}
