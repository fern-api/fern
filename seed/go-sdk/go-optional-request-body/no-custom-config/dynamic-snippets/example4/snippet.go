package example

import (
    context "context"

    fern "github.com/go-optional-request-body/fern"
    client "github.com/go-optional-request-body/fern/client"
    option "github.com/go-optional-request-body/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.PrunePlantRequest{
        PlantID: "plantId",
        Body: &fern.WateringRequest{
            Milliliters: fern.Float64(
                1.1,
            ),
        },
    }
    client.PrunePlant(
        context.TODO(),
        request,
    )
}
