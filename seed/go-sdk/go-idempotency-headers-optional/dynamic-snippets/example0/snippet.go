package example

import (
    context "context"

    fern "github.com/go-idempotency-headers-optional/fern"
    client "github.com/go-idempotency-headers-optional/fern/client"
    option "github.com/go-idempotency-headers-optional/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreatePaymentRequest{
        Amount: 1,
    }
    _, err := client.Service.Create(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
