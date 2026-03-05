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
            OrderId: "orderId",
            Amount: 1.1,
            Currency: "currency",
            PlantName: "plantName",
        },
    }
    client.CreatePlantOrder(
        context.TODO(),
        request,
    )
}
