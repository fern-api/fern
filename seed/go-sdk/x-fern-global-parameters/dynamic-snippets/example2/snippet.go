package example

import (
    context "context"

    fern "github.com/x-fern-global-parameters/fern"
    client "github.com/x-fern-global-parameters/fern/client"
    option "github.com/x-fern-global-parameters/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetProductsRequest{
        RegionID: "regionId",
        ProductID: "productId",
    }
    client.Products.Get(
        context.TODO(),
        request,
    )
}
