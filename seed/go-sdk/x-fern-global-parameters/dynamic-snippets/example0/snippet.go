package example

import (
    context "context"

    fern "github.com/x-fern-global-parameters/fern"
    client "github.com/x-fern-global-parameters/fern/client"
    option "github.com/x-fern-global-parameters/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SearchProductsRequest{
        RegionID: "regionId",
    }
    _, err := client.Products.Search(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
