package example

import (
    context "context"

    fern "github.com/allof-inline/fern"
    client "github.com/allof-inline/fern/client"
    option "github.com/allof-inline/fern/option"
)

func do() {
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
        WateringFrequency: fern.PlantPostWateringFrequencyDaily,
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
