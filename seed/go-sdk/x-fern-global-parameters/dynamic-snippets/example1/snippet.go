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
    request := &fern.SearchProductsRequest{
        RegionID: "regionId",
        Query: fern.String(
            "query",
        ),
        Config: &fern.SearchProductsRequestConfig{
            Currency: fern.String(
                "currency",
            ),
            Limit: fern.Int(
                1,
            ),
        },
    }
    client.Products.Search(
        context.TODO(),
        request,
    )
}
