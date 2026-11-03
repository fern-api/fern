package example

import (
    context "context"

    fern "github.com/openapi-request-body-ref/fern"
    client "github.com/openapi-request-body-ref/fern/client"
    option "github.com/openapi-request-body-ref/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateVendorRequest{
        Name: "name",
    }
    _, err := client.Vendor.CreateVendor(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
