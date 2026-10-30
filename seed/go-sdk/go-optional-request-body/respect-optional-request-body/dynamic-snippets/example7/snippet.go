package example

import (
    context "context"

    fern "github.com/go-optional-request-body/fern"
    client "github.com/go-optional-request-body/fern/client"
    option "github.com/go-optional-request-body/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.MistPlantRequest{
        PlantID: "plant-id",
    }
    _, err := client.MistPlant(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
