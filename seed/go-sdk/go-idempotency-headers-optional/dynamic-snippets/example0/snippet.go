package example

import (
    context "context"

    fern "github.com/go-idempotency-headers-optional/fern"
    client "github.com/go-idempotency-headers-optional/fern/client"
    option "github.com/go-idempotency-headers-optional/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreatePaymentRequest{
        Amount: 1,
    }
    client.Service.Create(
        context.TODO(),
        request,
    )
}
