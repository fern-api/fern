package example

import (
    client "github.com/allof-duplicate-properties/fern/client"
    option "github.com/allof-duplicate-properties/fern/option"
    fern "github.com/allof-duplicate-properties/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreatePlantOrderRequest{
        PlantId: "plantId",
        Body: &fern.PlantOrder{
            PlantName: "plantName",
            Quantity: fern.Int(
                1,
            ),
            OrderId: "orderId",
            Amount: 1.1,
            Currency: "currency",
            DateTime: fern.Time(
                fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
            ),
        },
    }
    client.CreatePlantOrder(
        context.TODO(),
        request,
    )
}
