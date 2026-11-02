package example

import (
    context "context"

    fern "github.com/allof-inline/fern"
    client "github.com/allof-inline/fern/client"
    option "github.com/allof-inline/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.TreeRecord{
        ID: "id",
        TreeName: "treeName",
        TreeSpecies: "treeSpecies",
    }
    _, err := client.CreateTree(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
