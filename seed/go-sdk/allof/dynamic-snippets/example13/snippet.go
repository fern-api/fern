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
    request := &fern.TreeRecord{
        TreeSpecies: fern.String(
            "treeSpecies",
        ),
        HeightInFeet: fern.Float64(
            1.1,
        ),
        ID: "id",
        TreeName: fern.String(
            "treeName",
        ),
        TreeDescription: fern.String(
            "treeDescription",
        ),
        PlantedDate: fern.Time(
            fern.MustParseDate(
                "2023-01-15",
            ),
        ),
    }
    client.CreateTree(
        context.TODO(),
        request,
    )
}
