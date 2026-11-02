package example

import (
    context "context"

    fern "github.com/openapi-subtitle/fern"
    client "github.com/openapi-subtitle/fern/client"
    option "github.com/openapi-subtitle/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetPlantRequest{
        PlantID: "plantId",
    }
    _, err := client.GetPlant(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
