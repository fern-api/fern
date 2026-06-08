package example

import (
    context "context"

    fern "github.com/allof/fern"
    client "github.com/allof/fern/client"
    option "github.com/allof/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.PlantPost{
        CommonName: fern.String(
            "commonName",
        ),
        WateringFrequency: fern.PlantBaseWateringFrequencyDaily.Ptr(),
        Species: "species",
        Family: "family",
        Genus: "genus",
        SunExposure: fern.PlantPostSunExposureFull,
        PlantedAt: fern.Time(
            fern.MustParseDate(
                "2023-01-15",
            ),
        ),
        SoilType: fern.String(
            "soilType",
        ),
    }
    client.CreatePlant(
        context.TODO(),
        request,
    )
}
