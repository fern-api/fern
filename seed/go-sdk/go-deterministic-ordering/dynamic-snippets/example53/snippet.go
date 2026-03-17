package example

import (
    client "github.com/go-deterministic-ordering/fern/client"
    option "github.com/go-deterministic-ordering/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := []byte("SGVsbG8gd29ybGQh")
    client.Endpoints.Primitive.GetAndReturnBase64(
        context.TODO(),
        request,
    )
}
