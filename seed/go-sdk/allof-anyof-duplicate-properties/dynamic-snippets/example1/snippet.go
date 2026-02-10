package example

import (
    client "github.com/allof-anyof-duplicate-properties/fern/client"
    option "github.com/allof-anyof-duplicate-properties/fern/option"
    fern "github.com/allof-anyof-duplicate-properties/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.Root{
        Id: fern.Int(
            1,
        ),
        OtherField: fern.String(
            "other_field",
        ),
        UniqueField: fern.String(
            "unique_field",
        ),
    }
    client.Repro(
        context.TODO(),
        request,
    )
}
