package example

import (
    context "context"

    fern "github.com/schemaless-request-body-examples/fern"
    client "github.com/schemaless-request-body-examples/fern/client"
    option "github.com/schemaless-request-body-examples/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UpdatePlantRequest{
        PlantID: "plantId",
        Body: map[string]any{
            "care": map[string]any{
                "light": "partial shade",
            },
            "name": "Updated Venus Flytrap",
        },
    }
    _, err := client.UpdatePlant(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
