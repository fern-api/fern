package example

import (
    context "context"
    fern "github.com/content-type/fern"
    client "github.com/content-type/fern/client"
    option "github.com/content-type/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.RegularPatchRequest{
        Field1: fern.String(
            "field1",
        ),
        Field2: fern.Int(
            1,
        ),
    }
    client.Service.RegularPatch(
        context.TODO(),
        "id",
        request,
    )
}
