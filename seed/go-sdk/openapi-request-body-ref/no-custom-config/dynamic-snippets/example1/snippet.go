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
    request := &fern.UpdateVendorBody{
        VendorID: "vendor_id",
        Body: &fern.UpdateVendorRequest{
            Name: "name",
            Status: fern.UpdateVendorRequestStatusActive.Ptr(),
        },
    }
    _, err := client.Vendor.UpdateVendor(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
