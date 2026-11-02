package example

import (
    context "context"

    fern "github.com/allof/fern"
    client "github.com/allof/fern/client"
    option "github.com/allof/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.PlantPost{
        Species: "species",
        Family: "family",
        Genus: "genus",
        CommonName: "commonName",
        WateringFrequency: fern.PlantBaseWateringFrequencyDaily,
        SunExposure: fern.PlantPostSunExposureFull,
    }
    _, err := client.CreatePlant(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
