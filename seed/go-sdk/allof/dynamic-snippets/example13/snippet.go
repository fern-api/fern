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
        ID: "id",
        TreeName: "treeName",
        TreeSpecies: "treeSpecies",
        PlantedDate: fern.Time(
            fern.MustParseDate(
                "2023-01-15",
            ),
        ),
        HeightInFeet: fern.Float64(
            1.1,
        ),
        TreeDescription: fern.String(
            "treeDescription",
        ),
    }
    client.CreateTree(
        context.TODO(),
        request,
    )
}
