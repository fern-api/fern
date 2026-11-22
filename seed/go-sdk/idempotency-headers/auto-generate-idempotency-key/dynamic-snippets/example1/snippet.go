package example

import (
    context "context"

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
    err := client.Payment.Delete(
        context.TODO(),
        "paymentId",
    )
    if err != nil {
        return err
    }
    return nil
}
