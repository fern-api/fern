package example

import (
    context "context"

    fern "github.com/openapi-request-body-ref/fern"
    client "github.com/openapi-request-body-ref/fern/client"
    option "github.com/openapi-request-body-ref/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateVendorRequest{
        IdempotencyKey: fern.String(
            "idempotencyKey",
        ),
        Name: "name",
        Address: fern.String(
            "address",
        ),
    }
    client.Vendor.CreateVendor(
        context.TODO(),
        request,
    )
}
