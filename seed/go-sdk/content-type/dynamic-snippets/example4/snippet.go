package example

import (
    client "github.com/content-type/fern/client"
    option "github.com/content-type/fern/option"
    context "context"
    fern "github.com/content-type/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.RegularPatch(
        context.TODO(),
        "id",
        &fern.RegularPatchRequest{
            Field1: fern.String(
                "field1",
            ),
            Field2: fern.Int(
                1,
            ),
        },
    )
}
