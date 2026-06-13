package example

import (
    context "context"

    fern "github.com/openapi-subtitle/fern"
    client "github.com/openapi-subtitle/fern/client"
    option "github.com/openapi-subtitle/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetPlantRequest{
        PlantID: "plantId",
    }
    client.GetPlant(
        context.TODO(),
        request,
    )
}
