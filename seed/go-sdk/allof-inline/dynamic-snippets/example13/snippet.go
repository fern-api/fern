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
    request := &fern.TreeRecord{
        ID: "id",
        TreeName: "treeName",
        TreeDescription: fern.String(
            "treeDescription",
        ),
        TreeSpecies: "treeSpecies",
        HeightInFeet: fern.Float64(
            1.1,
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
