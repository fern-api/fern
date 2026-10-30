package example

import (
    context "context"

    fern "github.com/idempotency-headers/fern"
    client "github.com/idempotency-headers/fern/client"
    option "github.com/idempotency-headers/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.CreatePaymentRequest{
        Amount: 1,
        Currency: fern.CurrencyUsd,
    }
    _, err := client.Payment.Create(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
